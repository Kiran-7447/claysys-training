function showVideo(){
    document.getElementById("myImage").style.display="none";
    document.getElementById("mainBtn").style.display="none";

    var video=document.getElementById("myVideo");
    video.style.display="block";
    video.muted=false;
    video.play();

    document.getElementById("controls").style.display="flex";
}

/* Replay */
function replayVideo(){
    var video=document.getElementById("myVideo");
    video.currentTime=0;
    video.play();

    document.getElementById("pauseBtn").innerText="Pause";
}

/* Toggle Play / Pause */
function toggleVideo(){
    var video=document.getElementById("myVideo");
    var btn=document.getElementById("pauseBtn");

    if(video.paused){
        video.play();
        btn.innerText="Pause";
    } else {
        video.pause();
        btn.innerText="Play";
    }
}

function goBack(){
    var video=document.getElementById("myVideo");
    video.pause();
    video.currentTime=0;
    video.style.display="none";

    document.getElementById("controls").style.display="none";
    document.getElementById("myImage").style.display="block";
    document.getElementById("mainBtn").style.display="block";

    document.getElementById("pauseBtn").innerText="Pause";
}