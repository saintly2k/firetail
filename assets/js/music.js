/**
 * Audiation - An Open-source music player, built with Electron.
 * Copyright (c) projsh_ 2018
 * 
 * This project is under the terms of the GNU General Public Licence (v.3.0).
 * 
 * THERE IS NO WARRANTY FOR THE PROGRAM, TO THE EXTENT PERMITTED BY
 * APPLICABLE LAW. EXCEPT WHEN OTHERWISE STATED IN WRITING THE COPYRIGHT
 * HOLDERS AND/OR OTHER PARTIES PROVIDE THE PROGRAM "AS IS" WITHOUT WARRANTY
 * OF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE ENTIRE RISK AS TO THE QUALITY AND PERFORMANCE OF THE PROGRAM
 * IS WITH YOU. SHOULD THE PROGRAM PROVE DEFECTIVE, YOU ASSUME THE COST OF
 * ALL NECESSARY SERVICING, REPAIR OR CORRECTION.
 * 
 * You should have recieved a copy of this licence along with this program.
 * If not, please visit the following website: http://www.gnu.org/licenses
 * 
 * Original Repo: https://github.com/projsh/audiation
 */

var audio;
var currentlyPlaying = false;
var fileTotal;
var newFileChosen;
var newFileName;
var pauseButtonActive = false;
var currentSongPlaying;
var allFilesList = [];
var repeatEnabled = false;
var artist;
var album;
var Title;
var tags;
var shuffleEnabled = false;
var shuffleOrder = [];
var fileSongListStore = [];
var fileAudio;
var songTitleName;
var durationSongLength;
var durationSeconds;
var durationMinutes;
var seconds;
var minutes;
var seekBar = document.querySelector('.seek-bar');
var seekBarWrapper = document.querySelector('.seek-bar-wrapper');
var fillBar = seekBar.querySelector('.fill');
var audioLength = document.querySelector('#songDuration');
var mouseDown = false;
var p;
var s = [];
var previousDuration;
var sortFileExt = {};
var shuffleList = [];
var shuffleCheck = false;
var shuffleWait = false;
var shuffleCurrent;
var highlightSong;

var os = require('os');
var fs = require('fs');
var id3 = require('jsmediatags');
var ver = '1.0b';
$('#audiationVer').text(`Audiation v.${ver}`);

$(document).ready(function () {
    setTimeout(function () {
        $('#loadCover').css({
            opacity: 0
        })
        setTimeout(function () {
            $('#loadCover').hide();
            document.body.style.cursor = 'default'
        }, 250)
    }, 250);
})

if (process.platform === 'win32') {
    $('.title-bar-wrapper').show();
    $('#openFileBrowser').show();
}

if (process.platform === 'linux') {
    $('.title-bar').hide();
    $('.app-content').css({
        marginTop: '20px'
    });
    $('#newContentWrapper h1').css({
        top: '0'
    });
    $('#playType').css({
        paddingTop: '15px'
    })
    $('.shadow-hide').css({
        top: '0'
    })
}

$('#newList').html('<p style="text-align: center">Loading...');

remote = require('electron').remote;
const {globalShortcut, dialog} = require('electron').remote;
const path = require('path');
remote.getCurrentWindow().setMinimumSize(720, 525);
document.addEventListener('dragover', event => event.preventDefault())
document.addEventListener('drop', event => event.preventDefault())
document.querySelector('img').draggable = false;

function songActive() {
    $(`#${highlightSong}`).css({
        color: '#c464f1'
    })
    $(`#${highlightSong} i`).css({
        opacity: 1
    })
    if (pauseButtonActive === false) {
        $(`#${highlightSong} i`).text('pause');
    } else {
        $(`#${highlightSong} i`).text('play_arrow');
    }
    shuffleWait = false;
}

function toolbarPlay() {
    remote.getCurrentWindow().setThumbarButtons([
        {
            tooltip: 'Previous',
            icon: path.join(__dirname, '/assets/image/skipprevious_white.png'),
            click() {
                previousSong()
            }
        },
        {
            tooltip: 'Play',
            icon: path.join(__dirname, '/assets/image/play_arrow_white.png'),
            click() {
                resumeButton();
            }
        },
        {
            tooltip: 'Skip',
            icon: path.join(__dirname, '/assets/image/skipnext_white.png'),
            click() {
                nextSong()
            }
        }
    ])
}

function toolbarPause() {
    remote.getCurrentWindow().setThumbarButtons([
        {
            tooltip: 'Previous',
            icon: path.join(__dirname, '/assets/image/skipprevious_white.png'),
            click() {
                previousSong()
            }
        },
        {
            tooltip: 'Pause',
            icon: path.join(__dirname, '/assets/image/pause_white.png'),
            click() {
                resumeButton();
            }
        },
        {
            tooltip: 'Skip',
            icon: path.join(__dirname, '/assets/image/skipnext_white.png'),
            click() {
                nextSong()
            }
        }
    ])
}

toolbarPlay();

function songActiveReset() {
    $('.play-pause').text('play_arrow');
    $(`.play-pause`).css({
        opacity: 0
    })
    $('.results-link').css({
        color: '#fff'
    })
}

function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

var fileextentions = ['mp3', 'm4a', 'wav', 'ogg', '3gp', 'aac', 'flac', 'webm', 'raw']

function loadFiles() {
    if (!fs.existsSync(`${os.homedir}/Music/Audiation`)) {
        fs.mkdirSync(`${os.homedir}/Music/Audiation`);
    }
    s = [];
    allFilesList = [];
    shuffleOrder = [];
    fileSongListStore = [];
    shuffleList = [];
    fs.readdir(`${os.homedir}/Music/Audiation`, (err, files) => {
        if (err) console.error(err);
        fileextentions.forEach((e) => {
            sortFileExt[e] = files.filter(f => f.split(".").pop() === e);
            s = s.concat(sortFileExt[e]);
            s.sort(function(a, b) {
                if (a.toLowerCase() < b.toLowerCase()) return -1;
                if (a.toLowerCase() > b.toLowerCase()) return 1;
                return 0;
            });
        });
        if (s.length === 0) {
            if (process.platform === 'win32') {
                $('#newList').html('<p style="text-align: center">No valid audio files found in the Audiation folder.<br><a class="open-file-browser">Click here</a> to open the Audiation folder.')
            } else {
                $('#newList').html('<p style="text-align: center">No valid audio files found in the Audiation folder.<br>Please add supported audio files to the folder.')
            }
            return $('.open-file-browser').click(function () {
                require('child_process').exec(`start "" "${os.homedir}\\Music\\Audiation`)
            });
        }
        fileTotal = s.length - 1;
        $('#newList').html('');
        s.forEach((f, i) => {
            fileSongListStore.push(f);
            allFilesList.push(f);
            fName = f.split('.');
            newFileName = f.slice(0, -fName[fName.length - 1].length - 1);
            $('#newList').append(`<li class="results-link" id="${i}"><i class="material-icons play-pause" style="opacity: 0; transition: .1s;">play_arrow</i><p class="new-song-title">${newFileName}`);
            if (currentlyPlaying === true && currentSongPlaying) {
                songActive();
            }
            $(`#${i}`).click(function () {
                shuffleCheck = false;
                if (shuffleEnabled == true) shuffleCheck = true;
                if (currentlyPlaying === true && $(this).attr('id') === `#${highlightSong}`.substr(1)) {
                    resumeButton();
                } else {
                    currentSongPlaying = i;
                    highlightSong = i;
                    songActiveReset();
                    newFileChosen = f;
                    newFileName = f.slice(0, -4)
                    if (currentlyPlaying === true) {
                        audioStop();
                    }
                    classicDetectSong();
                    $(`#pauseButton, #${highlightSong} i`).text('pause');
                    songActive();
                }
            });
            $(`#${i}`).mouseover(function () {
                $(`#${i} i`).css({
                    opacity: 1,
                })
            })
            $(`#${i}`).mouseleave(function () {
                if (shuffleEnabled == true && shuffleCheck == false && shuffleWait == true) {
                    if (shuffleList[currentSongPlaying] == i) {
                        $(`#${i} i`).css({
                            opacity: 1,
                        })
                    } else {
                        $(`#${i} i`).css({
                            opacity: 0
                        })
                        $(`#${i} i`).text('play_arrow');
                    }
                } else {
                    if (highlightSong == i) {
                        $(`#${i} i`).css({
                            opacity: 1,
                        })
                    } else {
                        $(`#${i} i`).css({
                            opacity: 0
                        })
                        $(`#${i} i`).text('play_arrow');
                    }
                }
            })
        })
        shuffleOrder = shuffle(allFilesList);
        allFilesList = fileSongListStore;
        shuffleOrder.forEach((f, i) => {
            shuffleList.push(fileSongListStore.indexOf(f));
        })
    })
}
loadFiles();
$('#openFileBrowser').click(function () {
    require('child_process').exec(`start "" "${os.homedir}\\Music\\Audiation`)
});

$('#refreshFiles').click(function () {
    $('#newList').html('<p style="text-align: center">Loading...');
    loadFiles();
})

function previousSong() {
    shuffleCheck = false;
    if (currentlyPlaying == true) {
        audioStop();
        songActiveReset();
    }
    if (shuffleEnabled === true) {
        allFilesList = shuffleOrder;
    } else {
        allFilesList = fileSongListStore;
    }
    currentSongPlaying = currentSongPlaying - 1;
    if (currentSongPlaying == -1 || currentlyPlaying == false) {
        currentSongPlaying = allFilesList.length - 1;
    }
    newFileChosen = allFilesList[currentSongPlaying];
    newFileName = newFileChosen.slice(0, -4);
    if (shuffleEnabled == true) {
        highlightSong = shuffleList[currentSongPlaying];
    } else {
        highlightSong = currentSongPlaying;
    }
    $(`#pauseButton, #${highlightSong} i`).text('pause');
    songActive();
    classicDetectSong();
}

function nextSong() {
    shuffleCheck = false;
    if (currentlyPlaying === true) {
        audioStop();
        songActiveReset();
    }
    if (shuffleEnabled === true) {
        allFilesList = shuffleOrder;
    } else {
        allFilesList = fileSongListStore;
    }
    currentSongPlaying = ++currentSongPlaying;
    if (currentSongPlaying == allFilesList.length) {
        currentSongPlaying = 0;
    }
    if (currentlyPlaying === false) {
        currentSongPlaying = 0;
    }
    newFileChosen = allFilesList[currentSongPlaying];
    newFileName = newFileChosen.slice(0, -4);
    if (shuffleEnabled == true) {
        highlightSong = shuffleList[currentSongPlaying];
    } else {
        highlightSong = currentSongPlaying;
    }
    $(`#pauseButton, #${highlightSong} i`).text('pause');
    songActive();
    classicDetectSong();
}

$('#backwardButton').click(function () {
    if (currentSongPlaying === allFilesList[0]) {
        audioStop(); 
    } else {
        previousSong();
    }
})

$('#forwardButton').click(function () {
    if (currentSongPlaying === allFilesList.length) {
        audioStop();
    } else {
        nextSong();
    }
});

$('#repeatButton').click(function () {
    switch (repeatEnabled) {
        case true:
            repeatEnabled = false;
            $(this).css({
                color: '#fff'
            });
            
            break;
        case false:
            repeatEnabled = true;
            $(this).css({
                color: '#c464f1'
            });
    }
});

$('#shuffleButton').click(function () {
    switch (shuffleEnabled) {
        case true:
            shuffleEnabled = false;
            $(this).css({
                color: '#fff'
            });
            shuffleWait = true;
            break;
        case false:
            shuffleEnabled = true;
            $(this).css({
                color: '#c464f1'
            });
            shuffleWait = true;
    }
})

$('.tb-close').click(function () {
    const remote = require('electron').remote;
    var window = remote.getCurrentWindow();
    window.close();
});

$('.tb-maximize').click(function () {
    const remote = require('electron').remote;
    var window = remote.getCurrentWindow();
    if (!window.isMaximized()) {
        window.maximize();
    } else {
        window.unmaximize();
    }
});
var window = remote.getCurrentWindow();
window.addEventListener('maximize', () => {
    console.log('maximise')
    $('.tb-maximize').html("<svg width='10' height='10' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M11 8.798H8.798V11H0V2.202h2.202V0H11v8.798zm-3.298-5.5h-6.6v6.6h6.6v-6.6zM9.9 1.1H3.298v1.101h5.5v5.5h1.1v-6.6z' fill='#fff'/></svg>")
})

window.addEventListener('unmaximize', () => {
    console.log('unmaximise')
    $('.tb-maximize').html('<svg id="TitleBarMaximize" width="12" height="12" viewBox="0 0 12 12"><rect width="9" height="9" x="1.5" y="1.5" fill="none" stroke="#ffffff"></rect></svg>')
});

window.addEventListener('blur', () => {
    $('.title-bar').css({
        background: '#222222'
    });
    $('.tb-button').css({
        opacity: .5
    })
})

window.addEventListener('focus', () => {
    $('.title-bar').css({
        background: 'rgb(27,27,27)'
    });
    $('.tb-button').css({
        opacity: 1
    })
})

$('.tb-minimize').click(function () {
    const remote = require('electron').remote;
    var window = remote.getCurrentWindow();
    window.minimize();

})

window.onkeydown = function (e) {
    return !(e.keyCode == 32);
};

document.addEventListener("keydown", function (e) {
    switch (e.which) {
        case 32:
            if (currentlyPlaying) {
                resumeButton();
            }
            break;
        case 116:
            dialog.showMessageBox(remote.getCurrentWindow(), {
                type: 'info',
                buttons: ['OK', 'Cancel'],
                title: 'Reload',
                message: 'Reloading will prevent media keys from functioning.'
            }, function(i) {
                if (i === 0) {
                    location.reload();
                }
            })
    }
});

globalShortcut.register('MediaPlayPause', resumeButton);
globalShortcut.register('MediaPreviousTrack', previousSong);
globalShortcut.register('MediaNextTrack', nextSong);

function noSongPlaying() {
    if (currentlyPlaying === false) {
        $('#songTitle, div.seek-bar, #songDuration').addClass('not-playing');
        $('#stopButton, .resume-button').addClass('button-active');
    } else {
        $('#songTitle, div.seek-bar, #songDuration').removeClass('not-playing');
        $('#stopButton, .resume-button').removeClass('button-active');
    }
}

noSongPlaying();

$('#settingsButton').click(function () {
    $('#settings').show();
})

$("#settingsClose").click(function () {
    $("#settings").hide();
})

function audioStop() {
    songActiveReset();
    audio.pause();
    audio.currentTime = 0;
    noSongPlaying();
    $('div.playing-now').removeClass('playing-now-active');
    $('div.play-button, select, div.play-type').show();
    pauseButtonActive = false;
}

function classicDetectSong() {
    try {
        if (audio) {
            audio.removeEventListener('timeupdate', seekTimeUpdate);
        }
        $('.new-nowplaying').addClass('np-active');
        currentlyPlaying = true;
        noSongPlaying();
        try {
            audio = new Audio(`${os.homedir}/Music/Audiation/${newFileChosen}`);
            audio.currentTime = 0;
            audio.play()
        } catch (err) {
            console.error(err);
            dialog.showErrorBox('Error', err)
            audioStop();
        }
        seekBarTrack();
        audio.volume = 1;
        
    } catch (err) {
        console.error(err.stack)
        currentlyPlaying = false;
        audioStop();
    }
}

$('#openDevTools').click(function () {
    var remote = require('electron').remote;
    remote.getCurrentWindow().toggleDevTools();
})

$('#pauseButton').click(function () {
    resumeButton()
})

function resumeButton() {
    if (currentlyPlaying == false) {
        pauseButtonActive = true;
        currentSongPlaying = 0;
        highlightSong = 0;
        newFileChosen = allFilesList[0];
        newFileName = newFileChosen.slice(0, -4);
        $(`#pauseButton, #${highlightSong} i`).text('pause');
        songActive();
        classicDetectSong();
    }
    switch (pauseButtonActive) {
        case false:
            pauseButtonActive = true;
            audio.pause();
            $(`#pauseButton, #${highlightSong} i`).text('play_arrow');
            
            $('title').text('Audiation');
            toolbarPlay();
            break;
        case true:
            pauseButtonActive = false;
            audio.play();
            $(`#pauseButton, #${highlightSong} i`).text('pause');
            toolbarPause();
            if (artist == "Unknown Artist") {
                $('title').text(`${newFileName}`);
            } else {
                $('title').text(`${artist} - ${Title}`)
            }
            toolbarPause();
    }
}

$('div.seek-bar-wrapper').mouseover(function () {
    if (currentlyPlaying === true) {
        $('div.handle').addClass('handle-hover');
    }
})

$('div.seek-bar-wrapper').mouseleave(function () {
    if (currentlyPlaying === true) {
        if (!mouseDown === false) return;
        $('div.handle').removeClass('handle-hover');
    }
})

function audioDuration() {
    durationSongLength = parseInt(audio.duration);
    durationMinutes = Math.floor(durationSongLength / 60);
    durationSeconds = Math.floor(durationSongLength / 1);
    while (durationSeconds >= 60) {
        durationSeconds = durationSeconds - 60;
    }
    if (durationSeconds > -1 && durationSeconds < 10) {
        durationSeconds = ('0' + durationSeconds).slice(-2);
    }
}

function seekTimeUpdate() {
    var p = audio.currentTime / audio.duration;
    fillBar.style.width = p * 100 + '%';
    if (audio.currentTime === audio.duration) {
        switch (repeatEnabled) {
            case true:
                audio.currentTime = 0;
                audio.play();
                break;
            case false:
                nextSong();
                break;
        }
    }
    var songLength = parseInt(audio.currentTime);
    minutes = Math.floor(songLength / 60);
    seconds = Math.floor(songLength / 1);
    while (seconds >= 60) {
        seconds = seconds - 60;
    }
    if (seconds > -1 && seconds < 10) {
        seconds = ('0' + seconds).slice(-2);
    }
    audioDuration();
    document.getElementById('songDurationTime').innerHTML = `${minutes}:${seconds}`
    document.getElementById('songDurationLength').innerHTML = `${durationMinutes}:${durationSeconds}`
}

function seekBarTrack() {
    new id3.Reader(`${os.homedir}/Music/Audiation/${newFileChosen}`)
        .setTagsToRead(['title', 'artist', 'picture', 'album'])
        .read({
            onSuccess: function (tag) {
                artist = tag.tags.artist;
                Title = tag.tags.title;
                album = tag.tags.album;
                newTags = tag;
                if (!tag.tags.artist) {
                    artist = 'Unknown Artist'
                }
                if (!tag.tags.album) {
                    album = 'Unknown Album'
                }
                if (!tag.tags.title) {
                    Title = newFileName;
                }
                var base64String = '';
                if (tag.tags.picture) {
                    for (var i = 0; i < tag.tags.picture.data.length; i++) {
                        base64String += String.fromCharCode(tag.tags.picture.data[i]);
                    }
                    document.getElementById('songPicture').src = 'data:' + tag.tags.picture.format + ';base64,' + btoa(base64String);
                } else {
                    document.getElementById('songPicture').src = './assets/svg/no_image.svg';
                }
                $('h1#songTitle').text(Title);
                $('#artist').text(`${album}  \u2022  ${artist}`);
                if (!tag.tags.artist) {
                    $('title').text(`${newFileName}`);
                } else {
                    $('title').text(`${artist} - ${Title}`)
                }
            },
            onError: function (tag) {
                $('#songTitle').text(newFileName);
                $('#artist').text('Unknown Album \u2022 Unknown Artist');
                document.getElementById('songPicture').src = './assets/svg/no_image.svg';
                if (!artist) {
                    $('title').text(`${newFileName}`);
                }
            }
        })
    audio.addEventListener('timeupdate', seekTimeUpdate);
}

function clamp(min, val, max) {
    return Math.min(Math.max(min, val), max);
}

function getP(e) {
    p = (e.clientX - seekBar.offsetLeft) / seekBar.clientWidth;
    p = clamp(0, p, 1);
    return p;
}

seekBarWrapper.addEventListener('mousedown', function (e) {
    if (currentlyPlaying === true) {
        mouseDown = true;
        p = getP(e);
        fillBar.style.width = p * 100 + '%';
        audio.removeEventListener('timeupdate', seekTimeUpdate);
        $('div.handle').addClass('handle-hover');
    }
});

window.addEventListener('mousemove', function (e) {
    if (currentlyPlaying === true) {
        if (!mouseDown) return;
        p = getP(e);
        fillBar.style.width = p * 100 + '%';
        minutes = Math.floor((p * audio.duration) / 60);
        seconds = Math.floor((p * audio.duration) / 1);
        while (seconds >= 60) {
            seconds = seconds - 60;
        }
        if (seconds > -1 && seconds < 10) {
            seconds = ('0' + seconds).slice(-2);
        }
        $('#songDurationTime').html(`${minutes}:${seconds}`);
    }
});

window.addEventListener('mouseup', function (e) {
    if (currentlyPlaying === true) {
        if (!mouseDown) return;
        mouseDown = false;
        p = getP(e);
        fillBar.style.width = p * 100 + '%';
        audio.currentTime = p * audio.duration;
        $('div.handle').removeClass('handle-hover');
        seekBarTrack();
    }
});