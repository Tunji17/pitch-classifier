import { useState, useRef } from "react";
import { PitchGraph } from "./plot-pitch";

export const AudioRecorder = () => {
    const [permission, setPermission] = useState(false);
    const [stream, setStream] = useState<any>(null);
    const [mimeType, setMimeType] = useState("audio/webm");
    const mediaRecorder: {
        current: MediaRecorder | {
            ondataavailable: (event: any) => void;
            onstop: () => void;
            start: () => void;
            stop: () => void;
        };

    } = useRef({
        ondataavailable: () => {},
        onstop: () => {},
        start: () => {},
        stop: () => {},
    });
    const [recordingStatus, setRecordingStatus] = useState("inactive");
    const [audioChunks, setAudioChunks] = useState([]);
    const [audioBlob, setAudioBlob] = useState<any>("");
    const [audio, setAudio] = useState("");

    const getMicrophonePermission = async () => {
        if ("MediaRecorder" in window) {
            try {
                const streamData: any = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                });
                setPermission(true);
                setStream(streamData);
            } catch (err: any) {
                alert(err.message);
            }
        } else {
            alert("The MediaRecorder API is not supported in your browser.");
        }
    };

    const mimeTypes = ["audio/webm", "video/mp4"];

    const startRecording = async (mimeIndex = 0) => {
        setRecordingStatus("recording");
        try {
            //Set the mimeType to the first item in the mimeTypes array

            const mimeType = mimeTypes[mimeIndex];
            MediaRecorder.isTypeSupported(mimeType);
            console.log("mimeType", mimeType);
            
            setMimeType(mimeType);
            //create new Media recorder instance using the stream
            const media: MediaRecorder = new MediaRecorder(stream, { mimeType });

            //set the MediaRecorder instance to the mediaRecorder ref
            mediaRecorder.current = media;
            //invokes the start method to start the recording process
            mediaRecorder.current.start();
            let localAudioChunks: any = [];
            mediaRecorder.current.ondataavailable = (event) => {
                if (typeof event.data === "undefined") return;
                if (event.data.size === 0) return;
                localAudioChunks.push(event.data);
                console.log("localAudioChunks", localAudioChunks);


            };

            setAudioChunks(localAudioChunks);
        } catch (err: any) {
            console.log("Error recording", err.message);
            
            // Retry with the next mimeType if the first mimeType fails
            const retries = mimeTypes.length;
            if (mimeIndex < retries) {
            startRecording(mimeIndex + 1);
          }
        }
      };

      const stopRecording = () => {
        setRecordingStatus("inactive");
        console.log("mimeType", mimeType);

        //stops the recording instance
        mediaRecorder?.current?.stop();
        mediaRecorder.current.onstop = () => {
          //creates a blob file from the audiochunks data
           const audioBlob = new Blob(audioChunks, { type: mimeType });
           console.log("audioBlob", audioBlob);
           setAudioBlob(audioBlob);
           
          //creates a playable URL from the blob file.
           const audioUrl = URL.createObjectURL(audioBlob);
           setAudio(audioUrl);
           setAudioChunks([]);
        };
      };


    return (
        <div>
            <h2>Audio Recorder</h2>
            <main>
                <div className="audio-controls">
                    {!permission ? (
                    <button className="btn-margin" onClick={getMicrophonePermission} type="button">
                        Get Microphone
                    </button>
                    ) : null}
                    {permission && recordingStatus === "inactive" ? (
                    <button className="btn-margin" onClick={() => startRecording(0)} type="button">
                        Start Recording
                    </button>
                    ) : null}
                    {recordingStatus === "recording" ? (
                    <button className="btn-margin" onClick={stopRecording} type="button">
                        Stop Recording
                    </button>
                    ) : null}
                    {
                        audioBlob ? (
                            <PitchGraph audioBlob={audioBlob} />
                        ) : null
                    }
                    {audio ? (
                        <div className="audio-container">
                            <audio src={audio} controls></audio>
                            <a download href={audio}>
                                Download Recording
                            </a>
                        </div>
                        ) : null}
                </div>
            </main>
        </div>
    );
};
