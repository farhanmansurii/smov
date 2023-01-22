import { MWMediaMeta, MWMediaType, MWSeasonMeta } from "./types";

export const JW_API_BASE = "https://apis.justwatch.com";
export const JW_IMAGE_BASE = "https://images.justwatch.com";

export type JWContentTypes = "movie" | "show";

export type JWSeasonShort = {
  title: string;
  id: number;
  season_number: number;
};

export type JWEpisodeShort = {
  title: string;
  id: number;
  episode_number: number;
};

export type JWMediaResult = {
  title: string;
  poster?: string;
  id: number;
  original_release_year: number;
  jw_entity_id: string;
  object_type: JWContentTypes;
  seasons?: JWSeasonShort[];
};

export type JWSeasonMetaResult = {
  title: string;
  id: string;
  season_number: number;
  episodes: JWEpisodeShort[];
};

export function mediaTypeToJW(type: MWMediaType): JWContentTypes {
  if (type === MWMediaType.MOVIE) return "movie";
  if (type === MWMediaType.SERIES) return "show";
  throw new Error("unsupported type");
}

export function JWMediaToMediaType(type: string): MWMediaType {
  if (type === "movie") return MWMediaType.MOVIE;
  if (type === "show") return MWMediaType.SERIES;
  throw new Error("unsupported type");
}

export function formatJWMeta(
  media: JWMediaResult,
  season?: JWSeasonMetaResult
): MWMediaMeta {
  const type = JWMediaToMediaType(media.object_type);
  let seasons: undefined | MWSeasonMeta[];
  if (type === MWMediaType.SERIES) {
    seasons = media.seasons
      ?.sort((a, b) => a.season_number - b.season_number)
      .map(
        (v): MWSeasonMeta => ({
          id: v.id.toString(),
          number: v.season_number,
          title: v.title,
        })
      );
  }

  return {
    title: media.title,
    id: media.id.toString(),
    year: media.original_release_year.toString(),
    poster: media.poster
      ? `${JW_IMAGE_BASE}${media.poster.replace("{profile}", "s166")}`
      : undefined,
    type,
    seasons: seasons as any,
    seasonData: season
      ? ({
          id: season.id.toString(),
          number: season.season_number,
          title: season.title,
          episodes: season.episodes
            .sort((a, b) => a.episode_number - b.episode_number)
            .map((v) => ({
              id: v.id.toString(),
              number: v.episode_number,
              title: v.title,
            })),
        } as any)
      : (undefined as any),
  };
}

export function JWMediaToId(media: MWMediaMeta): string {
  return ["JW", mediaTypeToJW(media.type), media.id].join("-");
}

export function decodeJWId(
  paramId: string
): { id: string; type: MWMediaType } | null {
  const [prefix, type, id] = paramId.split("-", 3);
  if (prefix !== "JW") return null;
  let mediaType;
  try {
    mediaType = JWMediaToMediaType(type);
  } catch {
    return null;
  }
  return {
    type: mediaType,
    id,
  };
}
