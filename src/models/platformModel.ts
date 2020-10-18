import { Collection, ObjectId } from "mongodb";
import platforms from "../../data/platforms";
import { Game } from "./gameModel";

type PlatformInput = {
  code?: number;
  connectivity?: string;
  cpu?: string;
  games?: {
    cover: {
      thumbnail?: string;
      url: string;
    };
    name: string;
    slug: string;
  }[];
  graphics?: string;
  media?: string;
  memory?: string;
  name: string;
  online?: string;
  os?: string;
  output?: string;
  platform_logo: {
    height: number;
    url: string;
    width: number;
  };
  platform_version_release_date?: string;
  resolutions?: string;
  slug: string;
  sound?: string;
  storage?: string;
  summary?: string;
  url?: string;
};

export type Platform = PlatformInput & {
  _id: ObjectId;
};

export default class PlatformModel {
  private collection: Collection;

  constructor(collection: Collection) {
    this.collection = collection;
  }

  findAll(): Promise<Platform[]> {
    return this.collection.find({}).toArray();
  }

  findById(id: ObjectId): Promise<Platform | null> {
    return this.collection.findOne({
      _id: id,
    });
  }

  findBySlug(slug: string): Promise<Platform | null> {
    return this.collection.findOne({
      slug: slug,
    });
  }

  async insertOne(payload: PlatformInput): Promise<Platform> {
    if (!payload.games) {
      payload.games = [];
    }
    const dbResponse = await this.collection.insertOne(payload);
    const { ops } = dbResponse;
    return ops[0];
  }

  async updateOne(id: ObjectId, payload: Platform): Promise<Platform> {
    const dbResponse = await this.collection.replaceOne({ _id: id }, payload);
    const { ops } = dbResponse;
    return ops[0];
  }

  async remove(id: ObjectId): Promise<void> {
    await this.collection.deleteOne({ _id: id });
  }

  async addGame(platform: Platform, game: Game): Promise<Platform> {
    if (platform.games && platform.games.find((g) => g.slug === game.slug)) {
      return platform;
    }
    if (!platform.games) {
      platform.games = [];
    }
    platform.games.push({
      slug: game.slug,
      name: game.name,
      cover: {
        url: game.cover.url,
      },
    });
    return this.updateOne(platform._id, platform);
  }

  validate(payload: Record<string, unknown>): string[] {
    const errors: string[] = [];

    const mandatoryKeys = ["name", "slug", "summary"];

    mandatoryKeys.forEach((key) => {
      if (!payload[key]) {
        errors.push(`Field '${key}' must be present.`);
      }
    });

    const platformLogo = payload.platform_logo as { width: number; height: number; url: string };
    if ((platformLogo && !platformLogo.height && !platformLogo.width && !platformLogo.url) || !payload.platform_logo) {
      errors.push("Field 'platform_logo' must be present with width, height and url.");
    }

    return errors;
  }
}
