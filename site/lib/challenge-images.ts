import type { ChallengeImage, ChallengeRecord } from './doraemon-data';

export const DEFAULT_CHALLENGE_IMAGE: ChallengeImage = {
  src: '/challenges/muon-tracks.jpg',
  alt: 'Muon particle tracks in a detector event',
  position: 'center center',
};

export function getChallengeImage(
  challenge: Pick<ChallengeRecord, 'hero_image' | 'image'>,
): ChallengeImage {
  return challenge.hero_image ?? challenge.image ?? DEFAULT_CHALLENGE_IMAGE;
}
