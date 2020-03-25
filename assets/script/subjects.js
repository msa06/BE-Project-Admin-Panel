//---------------------------------------------------------------------------------
//    Global Variable
//---------------------------------------------------------------------------------
let _courseID;

$(document).ready(function() {
  // Populate the Select Subject List
  populateCourseSelectList();
  //   Hide the Subject Row
  $(".subject-row").hide();
  // listSubjectList();

  //---------------------------------------------------------------------------------
  //    Event Change on the Course Selector
  //---------------------------------------------------------------------------------
  $('select[name="current_course_select"]').on("change", function() {
    _courseID = $(this).val();
    $(".subject-row").show();
    listSubjectList();
  });

  //   Add Subject Button
  $("#subject-submit-btn").on("click", function(e) {
    addSubject();
    e.preventDefault();
  });

  //   Update Subject Button
  $("#subject-update-btn").on("click", function(e) {
    updateSubject();
    e.preventDefault();
  });

  // Validation Rule
  $("#addsubjectform").validate({
    rules: {
      subject_name: {
        required: true,
        minlength: 5
      }
    },
    messages: {
      subject_name: {
        minlength: "Subject Name should be at least 5 characters"
      }
    }
  });

  // Edit Form Validation
  $("#editcourseform").validate({
    rules: {
      edit_subject_name: {
        required: true,
        minlength: 5
      }
    },
    messages: {
      edit_subject_name: {
        minlength: "Course Name should be at least 5 characters"
      }
    }
  });
});

//---------------------------------------------------------------------------------
//    Fetch the data from firebase and Populate the Courses Selector
//---------------------------------------------------------------------------------
function populateCourseSelectList() {
  $('select[name="current_course_select"]').html(`
    <option selected disabled>Select Courses</option>
    `);
  let ref = firebase.database().ref("portal_db/courses");
  ref.on("child_added", async data => {
    let courses = await data.val();
    $('select[name="current_course_select"]').append(`
            <option value="${courses.courseID}">${courses.coursename}</option>
            `);
  });
}

//---------------------------------------------------------------------------------
//    Add Subject to the Firebase
//---------------------------------------------------------------------------------
function addSubject() {
  let subjectname = $('input[name="subject_name"]');
  let subject = {
    subjectname: subjectname.val()
  };
  let subref = firebase
    .database()
    .ref("portal_db/courses")
    .child(_courseID)
    .child("subjects");

  subject.subjectID = subref.push().key;
  subref.child(subject.subjectID).set(subject);
  subjectname.val("");
  listSubjectList();
}

// find COurse By name
function findCourseByName(name) {
  let id;
  let ref = firebase.database().ref("portal_db/courses");
  ref.on("value", data => {
    let courses = data.val();
    for (let k in courses) {
      let course = courses[k];
      if (course.coursename == name) {
        id = course.courseID;
        break;
      }
    }
  });
  return id;
}

//---------------------------------------------------------------------------------
//    List All Subject on Firebase
//---------------------------------------------------------------------------------
function listSubjectList() {
  $("#courses-list").html("");
  let subref = firebase
    .database()
    .ref("portal_db/courses")
    .child(_courseID)
    .child("subjects");
  let count = 1;
  subref.on("child_added", data => {
    let subject = data.val();
    populateSubjectList(subject, count++);
  });
}

//---------------------------------------------------------------------------------
//    Populate All Subject on Firebase
//---------------------------------------------------------------------------------
function populateSubjectList(subject, count) {
  $("#courses-list").append(`
    <tr>
         <th scope="row">${count}</th>
            <td>
               ${subject.subjectname}
                  </td>
              <td><a class="btn btn-warning" href="#" onclick="editSubjects('${subject.subjectID}')" data-toggle="modal"
                                    data-target="#editSubjectModal"><i
                                                class="fas fa-pencil-alt"></i></a></td>
                                    <td> <a class="btn btn-danger" href="#" onclick="deleteSubjects('${subject.subjectID}')"><i
                                                class="fas fa-trash"></i></a></td>
                                </tr>
    `);
}

//---------------------------------------------------------------------------------
//    Find the Selected Subject using id and update the Form Fields
//---------------------------------------------------------------------------------
function editSubjects(id) {
  let subjectname = $('input[name="edit_subject_name"]');
  let subjectID = $('input[name="edit_subject_id"]');
  let subref = firebase
    .database()
    .ref("portal_db/courses")
    .child(_courseID)
    .child("subjects");

  subref.on("value", data => {
    let subjects = data.val();

    for (let k in subjects) {
      let subject = subjects[k];

      if (subject.subjectID == id) {
        subjectname.val(`${subject.subjectname}`);
        subjectID.val(`${subject.subjectID}`);
        break;
      }
    }
  });
}

//---------------------------------------------------------------------------------
//    Update the Subject details on Firebase
//---------------------------------------------------------------------------------
function updateSubject() {
  let subjectname = $('input[name="edit_subject_name"]');
  let subjectID = $('input[name="edit_subject_id"]');
  let subref = firebase
    .database()
    .ref("portal_db/courses")
    .child(_courseID)
    .child("subjects")
    .child(subjectID.val())
    .child("subjectname");
  subref.set(subjectname.val());
  listSubjectList();
}

//---------------------------------------------------------------------------------
//    Delete the Subject using id and update the table
//---------------------------------------------------------------------------------
function deleteSubjects(id) {
  let r = confirm(
    "Deleting a Subject will delete All the Data Associated With It"
  );
  if (r == true) {
    let f = confirm("Are you Sure");
    if (f == true) {
      let subref = firebase
        .database()
        .ref("portal_db/courses")
        .child(_courseID)
        .child("subjects");
      subref.child(id).remove();
      listSubjectList();
    }
  }
}
