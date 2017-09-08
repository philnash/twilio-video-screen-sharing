'use strict';
require('whatwg-fetch');
const Video = require('twilio-video');

let activeRoom;
let previewTracks;
let identity;

const previewContainer = document.getElementById('local-media');
const remoteContainer = document.getElementById('remote-media');

const joinButton = document.getElementById('button-join');
const leaveButton = document.getElementById('button-leave');
const previewButton = document.getElementById('button-preview');
const roomControls = document.getElementById('room-controls');
const roomNameInput = document.getElementById('room-name');

// Attach the Tracks to the DOM.
function attachTracks(tracks, container) {
  tracks.forEach(function(track) {
    container.appendChild(track.attach());
  });
}

// Attach the Participant's Tracks to the DOM.
function attachParticipantTracks(participant, container) {
  const tracks = Array.from(participant.tracks.values());
  attachTracks(tracks, container);
}

// Detach the Tracks from the DOM.
function detachTracks(tracks) {
  tracks.forEach(function(track) {
    track.detach().forEach(function(detachedElement) {
      detachedElement.remove();
    });
  });
}

// Detach the Participant's Tracks from the DOM.
function detachParticipantTracks(participant) {
  const tracks = Array.from(participant.tracks.values());
  detachTracks(tracks);
}

// When we are about to transition away from this page, disconnect
// from the room, if joined.
window.addEventListener('beforeunload', leaveRoomIfJoined);

// Obtain a token from the server in order to connect to the Room.
fetch('/token')
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    identity = data.identity;
    roomControls.style.display = 'block';

    // Bind button to join Room.
    joinButton.addEventListener('click', function() {
      const roomName = roomNameInput.value;
      if (!roomName) {
        alert('Please enter a room name.');
        return;
      }

      log("Joining room '" + roomName + "'...");
      const connectOptions = {
        name: roomName,
        logLevel: 'debug'
      };

      if (previewTracks) {
        connectOptions.tracks = previewTracks;
      }

      // Join the Room with the token from the server and the
      // LocalParticipant's Tracks.
      Video.connect(data.token, connectOptions).then(roomJoined, function(
        error
      ) {
        log('Could not connect to Twilio: ' + error.message);
      });
    });

    // Bind button to leave Room.
    leaveButton.addEventListener('click', function() {
      log('Leaving room...');
      activeRoom.disconnect();
    });
  });

// Successfully connected!
function roomJoined(room) {
  activeRoom = room;

  log("Joined as '" + identity + "'");
  joinButton.style.display = 'none';
  leaveButton.style.display = 'inline';

  // Attach LocalParticipant's Tracks, if not already attached.
  if (!previewContainer.querySelector('video')) {
    attachParticipantTracks(room.localParticipant, previewContainer);
  }

  // Attach the Tracks of the Room's Participants.
  room.participants.forEach(function(participant) {
    log("Already in Room: '" + participant.identity + "'");
    attachParticipantTracks(participant, remoteContainer);
  });

  // When a Participant joins the Room, log the event.
  room.on('participantConnected', function(participant) {
    log("Joining: '" + participant.identity + "'");
  });

  // When a Participant adds a Track, attach it to the DOM.
  room.on('trackAdded', function(track, participant) {
    log(participant.identity + ' added track: ' + track.kind);
    attachTracks([track], remoteContainer);
  });

  // When a Participant removes a Track, detach it from the DOM.
  room.on('trackRemoved', function(track, participant) {
    log(participant.identity + ' removed track: ' + track.kind);
    detachTracks([track]);
  });

  // When a Participant leaves the Room, detach its Tracks.
  room.on('participantDisconnected', function(participant) {
    log("Participant '" + participant.identity + "' left the room");
    detachParticipantTracks(participant);
  });

  // Once the LocalParticipant leaves the room, detach the Tracks
  // of all Participants, including that of the LocalParticipant.
  room.on('disconnected', function() {
    log('Left');
    if (previewTracks) {
      previewTracks.forEach(function(track) {
        track.stop();
      });
    }
    detachParticipantTracks(room.localParticipant);
    room.participants.forEach(detachParticipantTracks);
    activeRoom = null;
    joinButton.style.display = 'inline';
    leaveButton.style.display = 'none';
  });
}

// Preview LocalParticipant's Tracks.
previewButton.addEventListener('click', function() {
  const localTracksPromise = previewTracks
    ? Promise.resolve(previewTracks)
    : Video.createLocalTracks();

  localTracksPromise.then(
    function(tracks) {
      previewTracks = tracks;
      if (!previewContainer.querySelector('video')) {
        attachTracks(tracks, previewContainer);
      }
    },
    function(error) {
      console.error('Unable to access local media', error);
      log('Unable to access Camera and Microphone');
    }
  );
});

// Activity log.
function log(message) {
  const logDiv = document.getElementById('log');
  logDiv.innerHTML += '<p>&gt;&nbsp;' + message + '</p>';
  logDiv.scrollTop = logDiv.scrollHeight;
}

// Leave Room.
function leaveRoomIfJoined() {
  if (activeRoom) {
    activeRoom.disconnect();
  }
}
