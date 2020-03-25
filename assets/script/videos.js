let _courseID;
let _subjectID;
let _topicID;

$(document).ready(function() {
  // Populate the Select Subject List
  populateCourseSelectList();
  //   Hide the Subject Row
  $(".video-row").hide();
  $('select[name="current_course_select"]').on("change", function() {
    _courseID = $(this).val();
    // Populate the subject List
    populateSubjectSelectList();
  });

  // When we change Subject
  $('select[name="current_subject_select"]').on("change", function() {
    _subjectID = $(this).val();

    populateChapterSelectList();
  });

  $('select[name="current_chapter_select"]').on("change", function() {
    _topicID = $(this).val();
    // Show the Table
    $(".video-row").show();
    listVideoList();
  });

  //   Add Video Button
  $("#video-submit-btn").on("click", function(e) {
    addVideo();
    e.preventDefault();
  });

  //   Update Chapter Button
  $("#video-update-btn").on("click", function(e) {
    updateVideo();
    e.preventDefault();
  });
});

function populateCourseSelectList() {
  // $('select[name="current_course_select"]').html('');
  $('select[name="current_course_select"]').html(`
    <option selected disabled>Select Courses</option>
    `);
  let ref = firebase.database().ref("portal_db/courses");
  ref.on("child_added", data => {
    let courses = data.val();
    // for (let k in courses) {
    //   let course = courses[k];
    $('select[name="current_course_select"]').append(`
            <option value="${courses.courseID}">${courses.coursename}</option>
            `);
    // }
  });
}

function populateSubjectSelectList() {
  $('select[name="current_subject_select"]').html(`
  <option selected disabled>Choose Subject</option>
  `);
  $('select[name="current_chapter_select"]').html(`
  <option selected disabled>Choose Chapter</option>
  `);
  // let courseID = findCourseByName(_coursename);
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

function populateChapterSelectList() {
  $('select[name="current_chapter_select"]').html(`
  <option selected disabled>Choose Chapter</option>
  `);
  let topicref = firebase
    .database()
    .ref("portal_db/courses")
    .child(_courseID)
    .child("subjects")
    .child(_subjectID)
    .child("topics");

  topicref.on("child_added", data => {
    let topic = data.val();

    $('select[name="current_chapter_select"]').append(
      `<option value="${topic.topicID}">${topic.topicname}</option>`
    );
  });
}

// Add Video
function addVideo() {
  let videoname = $('input[name="video_name"]');
  let videodesc = $('input[name="video_desc"]');
  let videourl = $('input[name="video_url"]');
  let video = {
    videoname: videoname.val(),
    videoDescription: videodesc.val(),
    videoURL: videourl.val()
  };
  let videoref = firebase
    .database()
    .ref("portal_db/courses")
    .child(_courseID)
    .child("subjects")
    .child(_subjectID)
    .child("topics")
    .child(_topicID)
    .child("videos");
  video.videoUID = videoref.push().key;
  videoref.child(video.videoUID).set(video);
  videoname.val("");
  videodesc.val("");
  videourl.val("");

  listVideoList();
}

function listVideoList() {
  $("#video-list").html("");
  let videoref = firebase
    .database()
    .ref("portal_db/courses")
    .child(_courseID)
    .child("subjects")
    .child(_subjectID)
    .child("topics")
    .child(_topicID)
    .child("videos");
  let count = 1;
  videoref.on("child_added", data => {
    let video = data.val();

    $("#video-list").append(`
      <tr>
                                        <td scope="row">${count}</th>
                                        <td>
                                            ${video.videoname}
                                        </td>
                                        <td>${video.videoDescription}</td>
                                        <td><a class="btn btn-primary" href="${video.videoURL}"><i class="fas fa-play"></i></a></td>
                                        <td><a class="btn btn-warning" href="#"
                                                onclick="editVideo('${video.videoUID}')" data-toggle="modal"
                                                data-target="#editVideoModal"><i class="fas fa-pencil-alt"></i></a>
                                        </td>
                                        <td> <a class="btn btn-danger" href="#"
                                                onclick="deleteVideo('${video.videoUID}')"><i
                                                    class="fas fa-trash"></i></a></td>
                                    </tr>

      `);
    count++;
  });
}

function editVideo(id) {
  let videoname = $('input[name="edit_video_name"]');
  let videodesc = $('input[name="edit_video_desc"]');
  let videourl = $('input[name="edit_video_url"]');
  let videoid = $('input[name="edit_video_id"]');

  let videoref = firebase
    .database()
    .ref("portal_db/courses")
    .child(_courseID)
    .child("subjects")
    .child(_subjectID)
    .child("topics")
    .child(_topicID)
    .child("videos");

  videoref.on("value", data => {
    let videos = data.val();
    for (let k in videos) {
      let video = videos[k];
      if (video.videoUID == id) {
        videoname.val(`${video.videoname}`);
        videodesc.val(`${video.videoDescription}`);
        videourl.val(`${video.videoURL}`);
        videoid.val(`${video.videoUID}`);
        break;
      }
    }
  });
}

function updateVideo() {
  let videoname = $('input[name="edit_video_name"]');
  let videodesc = $('input[name="edit_video_desc"]');
  let videourl = $('input[name="edit_video_url"]');
  let videoid = $('input[name="edit_video_id"]');

  let video = {
    videoUID: videoid.val(),
    videoDescription: videodesc.val(),
    videoURL: videourl.val(),
    videoname: videoname.val()
  };

  let videoref = firebase
    .database()
    .ref("portal_db/courses")
    .child(_courseID)
    .child("subjects")
    .child(_subjectID)
    .child("topics")
    .child(_topicID)
    .child("videos")
    .child(video.videoUID)
    .set(video);
  listVideoList();

  videoname.val("");
  videodesc.val("");
  videourl.val("");
  videoid.val("");
}

function deleteVideo(id) {
  let f = confirm("Are you Sure");
  if (f == true) {
    let videoref = firebase
      .database()
      .ref("portal_db/courses")
      .child(_courseID)
      .child("subjects")
      .child(_subjectID)
      .child("topics")
      .child(_topicID)
      .child("videos")
      .child(id)
      .remove();
    listVideoList();
  }
}
