import { defer } from '@vercel/remix';
import type { LoaderArgs } from '@vercel/remix';
import { parseVercelId } from '~/parse-vercel-id';
import { AudioRecorder } from '~/components/audio';

export const config = { runtime: 'edge' };

let isCold = true;
let initialDate = Date.now();

export async function loader({ request }: LoaderArgs) {
  const wasCold = isCold;
  isCold = false;

  const parsedId = parseVercelId(request.headers.get("x-vercel-id"));

  return defer({
    isCold: wasCold,
    proxyRegion: sleep(parsedId.proxyRegion, 1000),
    computeRegion: sleep(parsedId.computeRegion, 1500),
    date: new Date().toISOString(),
  });
}

function sleep(val: any, ms: number) {
  return new Promise((resolve) => setTimeout(() => resolve(val), ms));
}

export function headers() {
  return {
    'x-edge-age': Date.now() - initialDate,
  };
}

export default function App() {
  return (
    <main>
      <AudioRecorder />
    </main>
  );
}
