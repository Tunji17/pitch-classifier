import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import * as PitchFinder from 'pitchfinder';

interface PitchGraphProps {
  audioBlob: Blob;
}

export const PitchGraph = ({audioBlob} : PitchGraphProps) => {

  const [pitchData, setPitchData] = useState<any>([]);

  const handleAudio = useCallback(async () => {

    try {
      const audioContext = new AudioContext();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const pitchDetector = PitchFinder.YIN();
  
      const float32Array = audioBuffer.getChannelData(0); // Assuming mono channel audio
      let pitches = [];
      let times = [];

      let data = [];
  
      for (let i = 0; i < float32Array.length; i += 4096) { // Step size for processing chunks
        const slice = float32Array.slice(i, i + 4096);
        const pitch = pitchDetector(slice);
        if (pitch) {
          pitches.push(pitch);
          times.push(i / audioContext.sampleRate); // Time in seconds
          data.push({ time: i / audioContext.sampleRate, pitch: pitch });
        }
      }

      console.log("Pitches", pitches);
      console.log("Times", times);

      setPitchData(data);
    } catch (error: any) {
      console.log("Error generating graph data", error.message);
    }
  }, [audioBlob]);

  useEffect(() => {
    handleAudio();
  }, [audioBlob, handleAudio]);

  console.log(pitchData);

  return (
    <div>
      {
        pitchData.length > 0 && (
        <LineChart
          width={500}
          height={300}
          className='btn-margin'
          data={pitchData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="pitch" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>

        )
      }
    </div>
  );
};
