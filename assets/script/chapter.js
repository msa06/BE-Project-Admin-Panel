//---------------------------------------------------------------------------------
//    Global Variable
//---------------------------------------------------------------------------------
let _courseID;
let _subjectID;

$(document).ready(function() {
  // Populate the Select Subject List
  populateCourseSelectList();

  //   Hide the Subject Row
  $(".chapter-row").hide();

  //---------------------------------------------------------------------------------
  //    Event Change on the Course Selector
  //---------------------------------------------------------------------------------
  $('select[name="current_course_select"]').on("change", function() {
    _courseID = $(this).val();
    // Populate the subject List
    populateSubjectSelectList();
  });

  //---------------------------------------------------------------------------------
  //    Event Change on the subject Selector
  //---------------------------------------------------------------------------------
  $('select[name="current_subject_select"]').on("change", function() {
    _subjectID = $(this).val();
    // Show the Table
    $(".chapter-row").show();
    listChapterList();
  });

  //   Add Chapter Button
  $("#chapter-submit-btn").on("click", function(e) {
    addChapter();
    e.preventDefault();
  });

  //   Update Chapter Button
  $("#chapter-update-btn").on("click", function(e) {
    updateChapter();
    e.preventDefault();
  });

  // Validation Rule
  $("#addchapterform").validate({
    rules: {
      chapter_name: {
        required: true,
        minlength: 5
      }
    },
    messages: {
      chapter_name: {
        minlength: "Chapter Name should be at least 5 characters"
      }
    }
  });

  // Edit Form Validation
  $("#editchapterform").validate({
    rules: {
      edit_chapter_name: {
        required: true,
        minlength: 5
      }
    },
    messages: {
      edit_chapter_name: {
        minlength: "Chapter Name should be at least 5 characters"
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
  ref.on("child_added", data => {
    let courses = data.val();
    $('select[name="current_course_select"]').append(`
            <option value="${courses.courseID}">${courses.coursename}</option>
            `);
  });
}

//---------------------------------------------------------------------------------
//    Fetch the data from firebase and Populate the Subject Selector
//---------------------------------------------------------------------------------
function populateSubjectSelectList() {
  $('select[name="current_subject_select"]').html(`
  <option selected disabled>Choose Subject</option>
  `);
  let subref = firebase
    .database()
    .ref("portal_db/courses")
    .child(_courseID)
    .child("subjects");
  subref.on("child_added", data => {
    let subject = data.val();
    $('select[name="current_subject_select"]').append(
      `<option value="${subject.subjectID}">${subject.subjectname}</option>`
    );
  });
}

//---------------------------------------------------------------------------------
//    Add Chapter to the Firebase
//---------------------------------------------------------------------------------
function addChapter() {
  let chaptername = $('input[name="chapter_name"]');
  let topic = {
    topicname: chaptername.val()
  };
  let chapref = firebase
    .database()
    .ref("portal_db/courses")
    .child(_courseID)
    .child("subjects")
    .child(_subjectID)
    .child("topics");

  topic.topicID = chapref.push().key;
  chapref.child(topic.topicID).set(topic);
  chaptername.val("");
  listChapterList();
}

//---------------------------------------------------------------------------------
//    List All Chapter on Firebase
//---------------------------------------------------------------------------------
function listChapterList() {
  $("#chapter-list").html("");
  let chapref = firebase
    .database()
    .ref("portal_db/courses")
    .child(_courseID)
    .child("subjects")
    .child(_subjectID)
    .child("topics");
  let count = 1;
  chapref.on("child_added", data => {
    let topic = data.val();
    $("#chapter-list").append(`
    <tr>
         <th scope="row">${count}</th>
            <td>
               ${topic.topicname}
                  </td>
              <td><a class="btn btn-warning" href="#" onclick="editChapter('${topic.topicID}')" data-toggle="modal"
                                    data-target="#editChapterModal"><i
                                                class="fas fa-pencil-alt"></i></a></td>
                                    <td> <a class="btn btn-danger" href="#" onclick="deleteChapter('${topic.topicID}')"><i
                                                class="fas fa-trash"></i></a></td>
                                </tr>
    `);
    count++;
  });
}

//---------------------------------------------------------------------------------
//    Find the Selected Chapter using id and update the Form Fields
//---------------------------------------------------------------------------------
function editChapter(id) {
  let chaptername = $('input[name="edit_chapter_name"]');
  let chapterid = $('input[name="edit_chapter_id"]');

  let chapref = firebase
    .database()
    .ref("portal_db/courses")
    .child(_courseID)
    .child("subjects")
    .child(_subjectID)
    .child("topics");
  chapref.on("value", data => {
    let topics = data.val();

    for (let k in topics) {
      let topic = topics[k];
      if (topic.topicID == id) {
        chaptername.val(`${topic.topicname}`);
        chapterid.val(`${topic.topicID}`);
        break;
      }
    }
  });
}

//---------------------------------------------------------------------------------
//    Update the Chapter details on Firebase
//---------------------------------------------------------------------------------
function updateChapter() {
  let chaptername = $('input[name="edit_chapter_name"]');
  let chapterid = $('input[name="edit_chapter_id"]');

  let chapref = firebase
    .database()
    .ref("portal_db/courses")
    .child(_courseID)
    .child("subjects")
    .child(_subjectID)
    .child("topics")
    .child(chapterid.val())
    .child("topicname")
    .set(chaptername.val());

  listChapterList();
  chaptername.val("");
  chapterid.val("");
}

//---------------------------------------------------------------------------------
//    Delete the Chapter using id and update the table
//---------------------------------------------------------------------------------
function deleteChapter(id) {
  let r = confirm(
    "Deleting a Chapter will delete All the Data Associated With It"
  );
  if (r == true) {
    let f = confirm("Are you Sure");
    if (f == true) {
      let chapref = firebase
        .database()
        .ref("portal_db/courses")
        .child(_courseID)
        .child("subjects")
        .child(_subjectID)
        .child("topics");
      chapref.child(id).remove();
      listChapterList();
    }
  }
}
