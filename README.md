# Baybayin Buddies: Filipino Words Game

A fun educational web app game designed to teach kindergarten children basic Filipino words starting with the letters Aa, Bb, Ii, Mm, Oo, and Ss.

## Features

- **Learn Mode**: Interactive flashcards with pronunciation, images, and English translations
- **Match Mode**: Matching game where children connect Filipino words with their corresponding images
- **Quiz Mode**: Multiple-choice quiz to test word recognition
- **Sticker Book**: Reward system where children earn stickers for completing activities
- **Authentic Filipino Pronunciation**: Hear the correct pronunciation of Filipino words using Google's Text-to-Speech technology
- **Parent/Teacher Tips**: Helpful guidance for adults assisting children

## Word Sets

The game includes the following Filipino words:

- **Mm**: mata, maya, mangga, mais, manok, mani, mami, mesa, misa
- **Ss**: sabon, saging, sako, sali, sipa, siko, sopas, sulat, susi
- **Aa**: aklat, ahas, ama, anak, anim, apoy, araw, aso, atis
- **Bb**: baboy, baka, baso, bata, bibig, bilog, bintana, bola, bulaklak
- **Ii**: ibon, ilaw, ilog, ilong, ipis, ipo-ipo, isa, isda, itlog
- **Oo**: obispo, otap, okra, orasan, oso, ospital, oras, orasyon, ostra

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/pinecrest/filipino-words-game.git
   cd filipino-words-game
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Building for Production

To create a production build:

```
npm run build
```

To start the production server:

```
npm start
```

## Deployment

This application is deployed on Netlify with the following configuration:

- **Node.js Version**: 18.17.0 (specified in netlify.toml)
- **Build Command**: `npm run build`
- **Publish Directory**: `.next`
- **Netlify Plugin**: @netlify/plugin-nextjs (v5.12.0)

The application uses dynamic API routes for text-to-speech functionality which are handled by Netlify Functions.

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Google Translate TTS API (for authentic Filipino pronunciation)
- Web Speech API (as fallback)

## Educational Value

This application helps children:
- Learn basic Filipino vocabulary
- Associate words with visual representations
- Practice pronunciation
- Develop matching and recognition skills
- Build confidence through rewards and achievements

## Usage Tips for Parents and Teachers

- Start with a small set of words (3-5) and gradually introduce more
- Encourage children to repeat the words after hearing the pronunciation
- Celebrate achievements with the sticker rewards system
- Use the parent/teacher tips provided in the Learn section
- Make learning interactive by acting out the meanings of words
- Use the audio pronunciation feature (🔊 icon) to hear authentic Filipino pronunciation
- Practice pronunciation together with your child to improve language skills

## License

MIT
