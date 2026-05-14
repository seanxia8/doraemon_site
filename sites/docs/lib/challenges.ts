import { challenges as challengeEntries } from 'collections/server';

export type Challenge = (typeof challengeEntries)[number];

export function getChallenges(): Challenge[] {
  return [...challengeEntries].sort((a, b) => {
    const orderDifference = (a.order ?? Number.MAX_SAFE_INTEGER) -
      (b.order ?? Number.MAX_SAFE_INTEGER);

    return orderDifference || a.title.localeCompare(b.title);
  });
}

export function getChallenge(slug: string): Challenge | undefined {
  return challengeEntries.find((challenge) => challenge.slug === slug);
}

export function getChallengeHref(challenge: Pick<Challenge, 'slug'>) {
  return `/challenges/${challenge.slug}`;
}
