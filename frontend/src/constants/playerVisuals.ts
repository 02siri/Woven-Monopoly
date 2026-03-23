import anchorToken from '../assets/anchor.png';
import dogToken from '../assets/dog.png';
import hatToken from '../assets/hat.png';
import shoeToken from '../assets/shoe.png';

export const PLAYER_AVATAR_URLS: Record<string, string> = {
  Peter: 'https://api.dicebear.com/9.x/toon-head/svg?seed=Easton',
  Billy: 'https://api.dicebear.com/9.x/toon-head/svg?seed=Luis',
  Charlotte: 'https://api.dicebear.com/9.x/toon-head/svg?seed=Riley',
  Sweedal: 'https://api.dicebear.com/9.x/toon-head/svg?seed=Andrea',
};

export const PLAYER_TOKEN_IMAGES: Record<string, string> = {
  Peter: dogToken,
  Billy: hatToken,
  Charlotte: anchorToken,
  Sweedal: shoeToken,
};
