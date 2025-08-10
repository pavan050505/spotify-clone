let currentSong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();
  console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  //show all the songs in playlist
  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li><img class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20")}</div>
                <div>Not Available</div>
            </div>
            <div class = "playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li></li>`;
  }

  //attach a eventlistner to a first song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML);
    });
  });
}

const playMusic = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track)
  currentSong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardcontainer");
  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];

      try {
        let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
        let response = await a.json();

        cardcontainer.innerHTML += `
          <div data-folder="${folder}" class="card">
            <div class="play">
              <img src="img/play.svg" alt>
            </div>
            <img src="/songs/${folder}/cover.jpg" alt>
            <h2>${response.title}</h2>
            <p>${response.description}</p>
          </div>`;
      } catch (err) {
        console.warn(`Skipping ${folder}:`, err);
      }
    }
  }

  //load the playlist when card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    });
  });
}


async function main() {
  //get the list of all the songs
  await getSongs("songs/ncs");
  playMusic(songs[0], true);

  //Display all the albums on the page
  displayAlbums();

  //attach an event listener to play, next and previous song
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  //add an event listner to a seek bar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  // add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  //add an event listener to previous and next
previous.addEventListener("click", () => {
    let currentTrack = decodeURIComponent(currentSong.src.split("/").pop());
    let index = songs.indexOf(currentTrack);
    if (index > 0) {
        playMusic(songs[index - 1]);
    }
});

next.addEventListener("click", () => {
    let currentTrack = decodeURIComponent(currentSong.src.split("/").pop());
    let index = songs.indexOf(currentTrack);
    if (index >= 0 && index < songs.length - 1) {
        playMusic(songs[index + 1]);
    }
});


  //add an event to a volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("setting volume to", e.target.value, "/ 100");
      currentSong.volume = parseInt(e.target.value) / 100;
    });

    //add event listner to mute the track 
document.querySelector(".volume>img").addEventListener("click", e => {
    if (e.target.src.includes("volume.svg")) {
        e.target.src = "img/mute.svg";
        currentSong.volume = 0;
          document
    .querySelector(".range")
    .getElementsByTagName("input")[0].value = 0
    } else {
        e.target.src = "img/volume.svg";
        currentSong.volume = 0.10;
        document
    .querySelector(".range")
    .getElementsByTagName("input")[0].value = 10
    }
});

}

main();
  