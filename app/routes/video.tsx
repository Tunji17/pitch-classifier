import type { LoaderArgs } from '@vercel/remix';

import { parseVercelId } from '~/parse-vercel-id';
import { VideoRecorder } from '~/components/video';


export const config = { runtime: 'edge' };

let isCold = true;
let initialDate = Date.now();

export async function loader({ request }: LoaderArgs) {
  const wasCold = isCold;
  isCold = false;

  const parsedId = parseVercelId(request.headers.get("x-vercel-id"));

  return {
    ...parsedId,
    isCold: wasCold,
    date: new Date().toISOString(),
  };
}

export function headers() {
  return {
    'x-edge-age': Date.now() - initialDate,
  };
}

export default function App() {
  return (
    <main>
      <VideoRecorder />
    </main>
  );
}
