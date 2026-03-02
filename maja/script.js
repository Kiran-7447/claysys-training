function showVideo(){
    document.getElementById("myImage").style.display="none";
    document.getElementById("mainBtn").style.display="none";

    var video=document.getElementById("myVideo");
    video.style.display="block";
    video.muted=false;
    video.play();

    document.getElementById("controls").style.display="flex";
}

function replayVideo(){
    var video=document.getElementById("myVideo");
    video.currentTime=0;
    video.play();
    document.getElementById("pauseBtn").innerHTML="❚❚";
}

function toggleVideo(){
    var video=document.getElementById("myVideo");
    var btn=document.getElementById("pauseBtn");

    if(video.paused){
        video.play();
        btn.innerHTML="❚❚";
    } else {
        video.pause();
        btn.innerHTML="▶";
    }
}

function goBack(){
    var video=document.getElementById("myVideo");
    video.pause();
    video.currentTime=0;
    video.style.display="none";

    document.getElementById("controls").style.display="none";
    document.getElementById("myImage").style.display="block";
    document.getElementById("mainBtn").style.display="inline-block";

    document.getElementById("pauseBtn").innerHTML="❚❚";
}