import { useState, useRef } from "react";

export const VideoRecorder = () => {
    const [permission, setPermission] = useState(false);
    const [stream, setStream] = useState<any>(null);
    const [mimeType, setMimeType] = useState("video/webm");

    const mediaRecorder: MediaStream | {
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
    const liveVideoFeed: any = useRef({
        srcObject: null,
    });
    const [recordingStatus, setRecordingStatus] = useState("inactive");
    const [videoChunks, setVideoChunks] = useState([]);
    const [recordedVideo, setRecordedVideo] = useState("");


    const getCameraPermission = async () => {
        setRecordedVideo("");
        if ("MediaRecorder" in window) {
            try {
                const videoConstraints = {
                    audio: false,
                    video: true,
                };
                const audioConstraints = { audio: true };
                // create audio and video streams separately
                const audioStream = await navigator.mediaDevices.getUserMedia(
                    audioConstraints
                );
                const videoStream = await navigator.mediaDevices.getUserMedia(
                    videoConstraints
                );
                setPermission(true);
                //combine both audio and video streams
                const combinedStream: MediaStream = new MediaStream([
                    ...videoStream.getVideoTracks(),
                    ...audioStream.getAudioTracks(),
                ]);
                setStream(combinedStream);
                //set videostream to live feed player
                liveVideoFeed.current.srcObject = videoStream;
            } catch (err: any) {
                alert(err.message);
            }
        } else {
            alert("The MediaRecorder API is not supported in your browser.");
        }
    };

    const mimeTypes = ["video/webm", "video/webm; codecs=vp9", "video/mp4"];

    const startRecording = async (mimeIndex = 0) => {
        setRecordingStatus("recording");
        try{
            // Set the mimeType to the first item in the mimeTypes array
            const mimeType = mimeTypes[mimeIndex];

            MediaRecorder.isTypeSupported(mimeType);
            setMimeType(mimeType);

            console.log("mimeType", mimeType);

            // Create new Media recorder instance using the stream
            const media = new MediaRecorder(stream, { mimeType });
            mediaRecorder.current = media;
            mediaRecorder.current.start();
            let localVideoChunks: any = [];
            mediaRecorder.current.ondataavailable = (event) => {
                if (typeof event.data === "undefined") return;
                if (event.data.size === 0) return;
                localVideoChunks.push(event.data);
            };
            setVideoChunks(localVideoChunks);
        } catch (err: any) {
            console.log("Error recording video", err.message);

            // Retry with the next mimeType
            if (mimeIndex < mimeTypes.length - 1) {
                startRecording(mimeIndex + 1);
            } else {
                alert("Unable to record video");
            }
        }
    };

    const stopRecording = () => {
        setPermission(false);
        setRecordingStatus("inactive");
        mediaRecorder.current.stop();
        mediaRecorder.current.onstop = () => {
            const videoBlob = new Blob(videoChunks, { type: mimeType });
            const videoUrl = URL.createObjectURL(videoBlob);
            setRecordedVideo(videoUrl);
            setVideoChunks([]);
        };
    };

    return (
        <div>
            <h2>Video Recorder</h2>
            <main>
                <div className="video-controls">
                    {!permission ? (
                        <button className="btn-margin" onClick={getCameraPermission} type="button">
                            Get Camera
                        </button>
                    ):null}
                    {permission  && recordingStatus === "inactive" ? (
                        <button className="btn-margin" onClick={() => startRecording(0)} type="button">
                            Start Recording
                        </button>
                    ):null}
                    {recordingStatus === "recording" ? (
                        <button className="btn-margin" onClick={stopRecording} type="button">
                            Stop Recording
                        </button>
                    ):null}
                    {
                        recordedVideo ? (
                            <div>
                                <video
                                    controls
                                    autoPlay
                                    ref={liveVideoFeed}
                                    style={{ width: "100%" }}
                                >
                                    <source src={recordedVideo} type="video/webm" />
                                </video>
                                <a href={recordedVideo}> Download Recording</a>
                            </div>
                        ):null
                    }
                </div>
            </main>
        </div>
    );
};
