import Array "mo:core/Array";
import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import VarArray "mo:core/VarArray";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type User = {
    id : Text;
    name : Text;
    email : Text;
    passwordHash : Text;
    role : Text;
    phone : Text;
    createdAt : Int;
  };

  type Appointment = {
    id : Text;
    patientId : Text;
    patientName : Text;
    doctorName : Text;
    department : Text;
    appointmentDate : Text;
    timeSlot : Text;
    tokenNumber : Nat;
    paymentStatus : Text;
    status : Text;
    createdAt : Int;
  };

  type AppointmentPartial = {
    id : Text;
    tokenNumber : Nat;
  };

  type PatientRecord = {
    id : Text;
    patientId : Text;
    patientName : Text;
    doctorName : Text;
    department : Text;
    diagnosis : Text;
    prescription : Text;
    doctorNotes : Text;
    visitDate : Text;
  };

  type LoginResponse = {
    sessionToken : Text;
    userId : Text;
    name : Text;
    role : Text;
  };

  type DashboardStats = {
    appointmentCount : Nat;
    doctorCount : Nat;
    patientCount : Nat;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
    role : Text;
  };

  let users = Map.empty<Text, User>();
  let appointments = Map.empty<Text, Appointment>();
  let patientRecords = Map.empty<Text, PatientRecord>();
  let sessionTokens = Map.empty<Text, Text>(); // sessionToken -> userId
  let userProfiles = Map.empty<Principal, UserProfile>();
  var currentTokenNumber = 1001;
  var consultationsCount = 0;

  module User {
    public func compare(user1 : User, user2 : User) : Order.Order {
      Text.compare(user1.id, user2.id);
    };
  };

  module Appointment {
    public func compareByTokenNumber(appointment1 : Appointment, appointment2 : Appointment) : Order.Order {
      let token1 = appointment1.tokenNumber;
      let token2 = appointment2.tokenNumber;
      Nat.compare(token1, token2);
    };
  };

  func generateId(uniqueifier : Text) : Text {
    let timestamp = Time.now().toText();
    let uniqueifier_str = timestamp.concat(uniqueifier);
    uniqueifier_str;
  };

  func validateSessionHelper(token : Text) : ?{ userId : Text; role : Text; name : Text } {
    switch (sessionTokens.get(token)) {
      case (null) { null };
      case (?userId) {
        switch (users.get(userId)) {
          case (null) { null };
          case (?user) {
            ?{
              userId = user.id;
              role = user.role;
              name = user.name;
            };
          };
        };
      };
    };
  };

  // Public endpoints - no authentication required
  public shared func register(name : Text, email : Text, phone : Text, passwordHash : Text, role : Text) : async {
    #ok : Text;
    #err : Text;
  } {
    let existing = users.values().find(func(u) { u.email == email });
    if (existing != null) {
      return #err("Email is already registered!");
    };

    let newId = generateId(email);
    let newUser : User = {
      id = newId;
      name;
      email;
      passwordHash;
      role;
      phone;
      createdAt = Time.now();
    };

    users.add(newId, newUser);

    let sessionToken = generateId(newId # "session");
    sessionTokens.add(sessionToken, newId);

    #ok(sessionToken);
  };

  public shared func login(email : Text, passwordHash : Text, role : Text) : async {
    #ok : LoginResponse;
    #err : Text;
  } {
    let userOpt = users.values().find(func(u) { u.email == email and u.passwordHash == passwordHash and u.role == role });
    switch (userOpt) {
      case (null) { #err("Invalid credentials!") };
      case (?user) {
        let sessionToken = generateId(user.id # "session");
        sessionTokens.add(sessionToken, user.id);

        let response : LoginResponse = {
          sessionToken = sessionToken;
          userId = user.id;
          name = user.name;
          role = user.role;
        };
        #ok(response);
      };
    };
  };

  public shared func logout(token : Text) : async () {
    sessionTokens.remove(token);
  };

  public shared func validateSession(token : Text) : async ?{
    userId : Text;
    role : Text;
    name : Text;
  } {
    validateSessionHelper(token);
  };

  // User profile management (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Authenticated endpoints
  public shared func bookAppointment(sessionToken : Text, doctorName : Text, department : Text, appointmentDate : Text, timeSlot : Text) : async {
    #ok : AppointmentPartial;
    #err : Text;
  } {
    let sessionOpt = validateSessionHelper(sessionToken);
    switch (sessionOpt) {
      case (null) { #err("Invalid session token!") };
      case (?(userData)) {
        // Only patients can book appointments
        if (userData.role != "patient") {
          return #err("Only patients can book appointments!");
        };

        let patientId = userData.userId;
        let patientName = userData.name;
        let appointmentId = generateId(patientId);

        // Check if the time slot is available
        let slotTaken = appointments.values().find(
          func(a) { a.doctorName == doctorName and a.appointmentDate == appointmentDate and a.timeSlot == timeSlot }
        );

        switch (slotTaken) {
          case (null) {
            let tokenNumber = currentTokenNumber;

            let newAppointment : Appointment = {
              id = appointmentId;
              patientId;
              patientName;
              doctorName;
              department;
              appointmentDate;
              timeSlot;
              tokenNumber;
              paymentStatus = "pending";
              status = "scheduled";
              createdAt = Time.now();
            };
            appointments.add(appointmentId, newAppointment);
            currentTokenNumber := tokenNumber + 1;

            let response : AppointmentPartial = {
              id = appointmentId;
              tokenNumber;
            };
            return #ok(response);
          };
          case (_) { return #err("This time slot is already taken!"); };
        };
      };
    };
  };

  public shared func confirmPayment(sessionToken : Text, appointmentId : Text) : async {
    #ok : Bool;
    #err : Text;
  } {
    let sessionOpt = validateSessionHelper(sessionToken);
    switch (sessionOpt) {
      case (null) { #err("Invalid session token!") };
      case (?(userData)) {
        switch (appointments.get(appointmentId)) {
          case (null) { #err("Appointment not found!") };
          case (?appointment) {
            // Only the patient who booked can confirm payment
            if (appointment.patientId != userData.userId) {
              return #err("Unauthorized: You can only confirm payment for your own appointments!");
            };

            let updatedAppointment = {
              appointment with
              paymentStatus = "confirmed";
            };
            appointments.add(appointmentId, updatedAppointment);
            #ok(true);
          };
        };
      };
    };
  };

  public query func getMyAppointments(sessionToken : Text) : async {
    #ok : [Appointment];
    #err : Text;
  } {
    let sessionOpt = validateSessionHelper(sessionToken);
    switch (sessionOpt) {
      case (null) { #err("Invalid session token!") };
      case (?(userData)) {
        let filtered = appointments.values().filter(
          func(a) {
            if (userData.role == "patient") {
              a.patientId == userData.userId
            } else if (userData.role == "doctor") {
              a.doctorName == userData.name
            } else {
              false
            }
          }
        ).toArray();
        #ok(filtered);
      };
    };
  };

  public query func getQueue(sessionToken : Text, date : Text) : async {
    #ok : [Appointment];
    #err : Text;
  } {
    let sessionOpt = validateSessionHelper(sessionToken);
    switch (sessionOpt) {
      case (null) { #err("Invalid session token!") };
      case (?(userData)) {
        // Doctors can see their queue, patients can see general queue
        let filtered = if (userData.role == "doctor") {
          appointments.values().filter(
            func(a) { a.doctorName == userData.name and a.appointmentDate == date }
          ).toArray()
        } else {
          appointments.values().filter(
            func(a) { a.appointmentDate == date }
          ).toArray()
        };

        let sorted = filtered.sort(Appointment.compareByTokenNumber);
        #ok(sorted);
      };
    };
  };

  public shared func completeConsultation(
    sessionToken : Text,
    appointmentId : Text,
    diagnosis : Text,
    prescription : Text,
    doctorNotes : Text,
  ) : async {
    #ok : Bool;
    #err : Text;
  } {
    let sessionOpt = validateSessionHelper(sessionToken);
    switch (sessionOpt) {
      case (null) { #err("Invalid session token!") };
      case (?(userData)) {
        // Only doctors can complete consultations
        if (userData.role != "doctor") {
          return #err("Only doctors can complete consultations!");
        };

        switch (appointments.get(appointmentId)) {
          case (null) { #err("Appointment not found!") };
          case (?appointment) {
            // Doctor can only complete their own appointments
            if (appointment.doctorName != userData.name) {
              return #err("Unauthorized: You can only complete your own appointments!");
            };

            let recordId = generateId(appointmentId);
            let newRecord : PatientRecord = {
              id = recordId;
              patientId = appointment.patientId;
              patientName = appointment.patientName;
              doctorName = userData.name;
              department = appointment.department;
              diagnosis;
              prescription;
              doctorNotes;
              visitDate = appointment.appointmentDate;
            };
            patientRecords.add(recordId, newRecord);

            let updatedAppointment = {
              appointment with
              status = "completed";
            };
            appointments.add(appointmentId, updatedAppointment);

            #ok(true);
          };
        };
      };
    };
  };

  public query func getPatientRecords(sessionToken : Text) : async {
    #ok : [PatientRecord];
    #err : Text;
  } {
    let sessionOpt = validateSessionHelper(sessionToken);
    switch (sessionOpt) {
      case (null) { #err("Invalid session token!") };
      case (?(userData)) {
        // Patients can only see their own records
        if (userData.role == "patient") {
          let filtered = patientRecords.values().filter(
            func(r) { r.patientId == userData.userId }
          ).toArray();
          #ok(filtered);
        } else {
          #err("Only patients can view their records!");
        };
      };
    };
  };

  public query func getDashboardStats() : async DashboardStats {
    let doctorCount = users.values().filter(func(user) { user.role == "doctor" }).toArray().size();
    let patientCount = users.values().filter(func(user) { user.role == "patient" }).toArray().size();
    let appointmentCount = appointments.keys().toArray().size();
    { doctorCount; patientCount; appointmentCount };
  };

  public query func getAllConsultations(sessionToken : Text) : async {
    #ok : [PatientRecord];
    #err : Text;
  } {
    let sessionOpt = validateSessionHelper(sessionToken);
    switch (sessionOpt) {
      case (null) { #err("Invalid session token!") };
      case (?(userData)) {
        // Doctors can see all their consultations
        if (userData.role == "doctor") {
          let filtered = patientRecords.values().filter(
            func(r) { r.doctorName == userData.name }
          ).toArray();
          #ok(filtered);
        } else {
          #err("Only doctors can view all consultations!");
        };
      };
    };
  };

  // Admin functions
  let defaultDoctors = [
    ("Priya Mehra", "priya@smartq.com"),
    ("Rajan Singh", "rajan@smartq.com"),
    ("Anita Sharma", "anita@smartq.com"),
    ("Suresh Patel", "suresh@smartq.com"),
    ("Neha Gupta", "neha@smartq.com"),
  ];

  func createDefaultDoctor(id : Text, name : Text, email : Text) : (Text, User) {
    (
      id,
      {
        id;
        name;
        email;
        passwordHash = "doctor123";
        role = "doctor";
        phone = "1234567890";
        createdAt = Time.now();
      },
    );
  };

  func initializeDefaultDoctors() {
    for (entry in defaultDoctors.values()) {
      let doctorId = generateId(entry.0);
      let doctor = createDefaultDoctor(doctorId, entry.0, entry.1);
      users.add(doctorId, doctor.1);
    };
  };

  public shared ({ caller }) func initialize() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can initialize the system!");
    };

    users.clear();
    sessionTokens.clear();
    appointments.clear();
    patientRecords.clear();
    currentTokenNumber := 1001;

    initializeDefaultDoctors();
  };

  public shared ({ caller }) func resetAppointments() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reset appointments!");
    };
    appointments.clear();
    currentTokenNumber := 1001;
  };
};
