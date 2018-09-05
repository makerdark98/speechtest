var recorder = [];
var ratings = [];
var audio = [];
var now_evalution = null;
var reader = new window.FileReader();
const recordAudio = () => {
  return new Promise(resolve => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];

        mediaRecorder.addEventListener("dataavailable", event => {
          audioChunks.push(event.data);
        });

        const start = () => {
          mediaRecorder.start();
        };

        const stop = () => {
          return new Promise(resolve => {
            mediaRecorder.addEventListener("stop", () => {
              const audioBlob = new Blob(audioChunks);
              const audioUrl = URL.createObjectURL(audioBlob);
              const audio = new Audio(audioUrl);
              const play = () => {
                audio.play();
              };

              resolve({ audioBlob, audioUrl, play });
            });

            mediaRecorder.stop();
          });
        };

        resolve({ start, stop });
      });
  });
};
function onRecord(){
    var recordbtn = $(this);
    var id = recordbtn.attr('id');
    if(recordbtn.html() === 'Record'){
        console.log('record');
        recordAudio().then(tmprecorder => {
                recorder[id] = tmprecorder;
                recorder[id].start();
                recordbtn.html('Stop');
            }
        );
    } else {
        console.log('stop');
        recorder[id].stop().then( tmpaudio => {
            audio[id] = tmpaudio;
        });
        recordbtn.html('Record');
        var playbtn = $('#'+id+'.play');
        playbtn.attr('disabled', false);
        var sendbtn = $('#'+id+'.send');
        sendbtn.attr('disabled', false);
    }
}
function onPlay(){
    var playbtn = $(this);
    var id = playbtn.attr('id');
    audio[id].play();
}

function onSend(){
    var sendbtn = $(this);
    var id = sendbtn.attr('id');
    var sentence = $('#'+id+'.sentence');
    reader.readAsDataURL(audio[id].audioBlob);
    reader.onloadend = function() {
        var base64String = reader.result;//.split(',')[1];
        sendAudio(sentence.html(), base64String);
        now_evalution = id;
    }
}

function sendAudio(script, audio){
    $.ajax({
        type: 'POST',
        url: 'send',
        data: JSON.stringify({
            script: script,
            audio: audio
        }),
        contentType: "application/json; charset=utf-8",
        dataType:"json",
        success: function (body) {
            console.log(body);
            ratings[now_evalution] = body.return_object.score;
            var starPercentageRounded = Math.round((ratings[now_evalution]/5)*10)*10+'%';
            $('#'+now_evalution+'.stars-inner').width(starPercentageRounded);
        }
    });
}

$('.record').click(onRecord);
$('.play').click(onPlay);
$('.send').click(onSend);