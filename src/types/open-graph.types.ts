import { z } from '@hono/zod-openapi';

export const OpenGraphScrapeRequestSchema = z.object({
  url: z
    .string()
    .url()
    .openapi({
      param: {
        name: 'url',
        in: 'query',
      },
      example:
        'https://medium.com/hmif-itb/5-life-lessons-i-learned-from-competitions-f7f34a40fd30',
    }),
});

export const OpenGraphErrorSchema = z.object({
  error: z.string().openapi({ example: '404 Not Found' }),
  errorDetails: z.any().openapi({ example: '{}' }),
  success: z.boolean().default(false),
});

export const CustomMetaTagsSchema = z.object({
  fieldName: z.string(),
  multiple: z.boolean(),
  property: z.string(),
});

export const TwitterImageObjectSchema = z.object({
  alt: z.string().optional(),
  height: z.number().optional(),
  url: z.string(),
  width: z.number().optional(),
});

export const TwitterPlayerObjectSchema = z.object({
  height: z.number().optional(),
  stream: z.string().optional(),
  url: z.string(),
  width: z.number().optional(),
});

export const ImageObjectSchema = z.object({
  height: z.union([z.string(), z.number()]).optional(),
  type: z.string().optional(),
  url: z.string(),
  width: z.union([z.string(), z.number()]).optional(),
  alt: z.string().optional(),
});

export const VideoObjectSchema = z.object({
  height: z.number().optional(),
  type: z.string().optional(),
  url: z.string(),
  width: z.number().optional(),
});

export const MusicSongObjectSchema = z.object({
  disc: z.string().optional(),
  track: z.number().optional(),
  url: z.string(),
});

export const OgObjectInteralSchema = z.object({
  alAndroidAppName: z.string().optional(),
  alAndroidClass: z.string().optional(),
  alAndroidPackage: z.string().optional(),
  alAndroidUrl: z.string().optional(),
  alIosAppName: z.string().optional(),
  alIosAppStoreId: z.string().optional(),
  alIosUrl: z.string().optional(),
  alIpadAppName: z.string().optional(),
  alIpadAppStoreId: z.string().optional(),
  alIpadUrl: z.string().optional(),
  alIphoneAppName: z.string().optional(),
  alIphoneAppStoreId: z.string().optional(),
  alIphoneUrl: z.string().optional(),
  alWebShouldFallback: z.string().optional(),
  alWebUrl: z.string().optional(),
  alWindowsAppId: z.string().optional(),
  alWindowsAppName: z.string().optional(),
  alWindowsPhoneAppId: z.string().optional(),
  alWindowsPhoneAppName: z.string().optional(),
  alWindowsPhoneUrl: z.string().optional(),
  alWindowsUniversalAppId: z.string().optional(),
  alWindowsUniversalAppName: z.string().optional(),
  alWindowsUniversalUrl: z.string().optional(),
  alWindowsUrl: z.string().optional(),
  articleAuthor: z.string().optional(),
  articleExpirationTime: z.string().optional(),
  articleModifiedTime: z.string().optional(),
  articlePublishedTime: z.string().optional(),
  articlePublisher: z.string().optional(),
  articleSection: z.string().optional(),
  articleTag: z.string().optional(),
  author: z.string().optional(),
  bookAuthor: z.string().optional(),
  bookCanonicalName: z.string().optional(),
  bookIsbn: z.string().optional(),
  bookReleaseDate: z.string().optional(),
  booksBook: z.string().optional(),
  booksRatingScale: z.string().optional(),
  booksRatingValue: z.string().optional(),
  bookTag: z.string().optional(),
  businessContactDataCountryName: z.string().optional(),
  businessContactDataLocality: z.string().optional(),
  businessContactDataPostalCode: z.string().optional(),
  businessContactDataRegion: z.string().optional(),
  businessContactDataStreetAddress: z.string().optional(),
  charset: z.string().optional(),
  customMetaTags: z.record(z.string()).optional(),
  dcContributor: z.string().optional(),
  dcCoverage: z.string().optional(),
  dcCreator: z.string().optional(),
  dcDate: z.string().optional(),
  dcDateCreated: z.string().optional(),
  dcDateIssued: z.string().optional(),
  dcDescription: z.string().optional(),
  dcFormatMedia: z.string().optional(),
  dcFormatSize: z.string().optional(),
  dcIdentifier: z.string().optional(),
  dcLanguage: z.string().optional(),
  dcPublisher: z.string().optional(),
  dcRelation: z.string().optional(),
  dcRights: z.string().optional(),
  dcSource: z.string().optional(),
  dcSubject: z.string().optional(),
  dcTitle: z.string().optional(),
  dcType: z.string().optional(),
  favicon: z.string().optional(),
  fbAppId: z.string().optional(),
  jsonLD: z.array(z.any()).optional(),
  modifiedTime: z.string().optional(),
  musicAlbum: z.string().optional(),
  musicAlbumDisc: z.string().optional(),
  musicAlbumTrack: z.string().optional(),
  musicAlbumUrl: z.string().optional(),
  musicCreator: z.string().optional(),
  musicDuration: z.string().optional(),
  musicMusician: z.string().optional(),
  musicPlaylist: z.string().optional(),
  musicRadioStation: z.string().optional(),
  musicReleaseDate: z.string().optional(),
  musicSong: z.array(MusicSongObjectSchema).optional(),
  musicSongDisc: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  musicSongProperty: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  musicSongTrack: z
    .union([z.number(), z.array(z.string()), z.array(z.null())])
    .optional(),
  musicSongUrl: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  ogArticleAuthor: z.string().optional(),
  ogArticleExpirationTime: z.string().optional(),
  ogArticleModifiedTime: z.string().optional(),
  ogArticlePublishedTime: z.string().optional(),
  ogArticlePublisher: z.string().optional(),
  ogArticleSection: z.string().optional(),
  ogArticleTag: z.string().optional(),
  ogAudio: z.string().optional(),
  ogAudioSecureURL: z.string().optional(),
  ogAudioType: z.string().optional(),
  ogAudioURL: z.string().optional(),
  ogAvailability: z.string().optional(),
  ogDate: z.string().optional(),
  ogDescription: z.string().optional(),
  ogDeterminer: z.string().optional(),
  ogEpisode: z.string().optional(),
  ogImage: z.array(ImageObjectSchema).optional(),
  ogImageAlt: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  ogImageHeight: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  ogImageProperty: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  ogImageSecureURL: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  ogImageType: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  ogImageURL: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  ogImageWidth: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  ogLocale: z.string().optional(),
  ogLocaleAlternate: z.string().optional(),
  ogLogo: z.string().optional(),
  ogMovie: z.string().optional(),
  ogPriceAmount: z.string().optional(),
  ogPriceCurrency: z.string().optional(),
  ogProductAvailability: z.string().optional(),
  ogProductCondition: z.string().optional(),
  ogProductPriceAmount: z.string().optional(),
  ogProductPriceCurrency: z.string().optional(),
  ogProductRetailerItemId: z.string().optional(),
  ogSiteName: z.string().optional(),
  ogTitle: z.string().optional(),
  ogType: z.string().optional(),
  ogUrl: z.string().optional(),
  ogVideo: z.array(VideoObjectSchema).optional(),
  ogVideoActor: z.string().optional(),
  ogVideoActorId: z.string().optional(),
  ogVideoActorRole: z.string().optional(),
  ogVideoDirector: z.string().optional(),
  ogVideoDuration: z.string().optional(),
  ogVideoHeight: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  ogVideoOther: z.string().optional(),
  ogVideoProperty: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  ogVideoReleaseDate: z.string().optional(),
  ogVideoSecureURL: z.string().optional(),
  ogVideoSeries: z.string().optional(),
  ogVideoTag: z.string().optional(),
  ogVideoTvShow: z.string().optional(),
  ogVideoType: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  ogVideoWidth: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  ogVideoWriter: z.string().optional(),
  ogWebsite: z.string().optional(),
  placeLocationLatitude: z.string().optional(),
  placeLocationLongitude: z.string().optional(),
  profileFirstName: z.string().optional(),
  profileGender: z.string().optional(),
  profileLastName: z.string().optional(),
  profileUsername: z.string().optional(),
  publishedTime: z.string().optional(),
  releaseDate: z.string().optional(),
  requestUrl: z.string().optional(),
  restaurantContactInfoCountryName: z.string().optional(),
  restaurantContactInfoEmail: z.string().optional(),
  restaurantContactInfoLocality: z.string().optional(),
  restaurantContactInfoPhoneNumber: z.string().optional(),
  restaurantContactInfoPostalCode: z.string().optional(),
  restaurantContactInfoRegion: z.string().optional(),
  restaurantContactInfoStreetAddress: z.string().optional(),
  restaurantContactInfoWebsite: z.string().optional(),
  restaurantMenu: z.string().optional(),
  restaurantRestaurant: z.string().optional(),
  restaurantSection: z.string().optional(),
  restaurantVariationPriceAmount: z.string().optional(),
  restaurantVariationPriceCurrency: z.string().optional(),
  success: z.boolean().optional(),
  twitterAccount: z.string().optional(),
  twitterAppIdGooglePlay: z.string().optional(),
  twitterAppIdiPad: z.string().optional(),
  twitterAppIdiPhone: z.string().optional(),
  twitterAppNameGooglePlay: z.string().optional(),
  twitterAppNameiPad: z.string().optional(),
  twitterAppNameiPhone: z.string().optional(),
  twitterAppUrlGooglePlay: z.string().optional(),
  twitterAppUrliPad: z.string().optional(),
  twitterAppUrliPhone: z.string().optional(),
  twitterCard: z.string().optional(),
  twitterCreator: z.string().optional(),
  twitterCreatorId: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImage: z.array(TwitterImageObjectSchema).optional(),
  twitterImageAlt: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  twitterImageHeight: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  twitterImageProperty: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  twitterImageSrc: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  twitterImageWidth: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  twitterPlayer: z.array(TwitterPlayerObjectSchema).optional(),
  twitterPlayerHeight: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  twitterPlayerProperty: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  twitterPlayerStream: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  twitterPlayerStreamContentType: z.string().optional(),
  twitterPlayerWidth: z
    .union([z.string(), z.array(z.string()), z.array(z.null())])
    .optional(),
  twitterSite: z.string().optional(),
  twitterSiteId: z.string().optional(),
  twitterTitle: z.string().optional(),
  twitterUrl: z.string().optional(),
  updatedTime: z.string().optional(),
});

export const OgObjectSchema = OgObjectInteralSchema.omit({
  musicSongDisc: true,
  musicSongProperty: true,
  musicSongTrack: true,
  musicSongUrl: true,
  ogImageHeight: true,
  ogImageProperty: true,
  ogImageSecureURL: true,
  ogImageType: true,
  ogImageURL: true,
  ogImageWidth: true,
  ogVideoHeight: true,
  ogVideoProperty: true,
  ogVideoType: true,
  ogVideoWidth: true,
  twitterImageAlt: true,
  twitterImageHeight: true,
  twitterImageProperty: true,
  twitterImageSrc: true,
  twitterImageWidth: true,
  twitterPlayerHeight: true,
  twitterPlayerProperty: true,
  twitterPlayerStream: true,
  twitterPlayerWidth: true,
}).openapi('OgObject');
