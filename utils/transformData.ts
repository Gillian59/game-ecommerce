import games from "../data/games";
import platforms from "../data/platforms";

type PlatformData = {
  code: number;
  slug: string;
};

type GameData = {
  platforms: number[];
};

type PlatformGame = {
  slug: string;
  name: string;
  platform_logo: {
    url: string;
    width: number;
    height: number;
  };
};

type GameWithPlatforms = {
  [key: string]: unknown;
  platforms: PlatformGame[];
};

type PlatformWithGames = {
  [key: string]: unknown;
  games: Record<string, unknown>[];
};

const transformGame = (game: GameData): GameWithPlatforms => {
  const gamePlatforms: PlatformGame[] = [];
  game.platforms.forEach((platformCode) => {
    const platform = platforms.find((platformData) => platformData.code === platformCode);
    if (platform) {
      gamePlatforms.push({
        name: platform.name,
        slug: platform.slug,
        platform_logo: platform.platform_logo,
      });
    }
  });

  return {
    ...game,
    platforms: gamePlatforms,
  };
};

const transformPlatform = (platform: PlatformData): PlatformWithGames => {
  const ptfGames = games.filter((game) => game.platforms.includes(platform.code));
  const platformWithGames = Object.assign({}, platform);

  return {
    ...platformWithGames,
    games: ptfGames.map((game) => {
      return {
        slug: game.slug,
        cover: game.cover,
        name: game.name,
      };
    }),
  };
};

export default (): [GameWithPlatforms[], PlatformWithGames[]] => {
  return [games.map(transformGame), platforms.map(transformPlatform)];
};
