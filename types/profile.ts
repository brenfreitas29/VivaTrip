export const COUNTRY_CODES = `AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`.split(" ");

export const PROFILE_LANGUAGES = ["pt", "en", "es"] as const;
export const PROFILE_CURRENCIES = ["USD", "EUR", "BRL", "ARS", "GBP", "JPY"] as const;
export const TRAVEL_STYLES = ["relaxed", "moderate", "intensive"] as const;

export type ProfileLanguage = (typeof PROFILE_LANGUAGES)[number];
export type ProfileCurrency = (typeof PROFILE_CURRENCIES)[number];
export type TravelStyle = (typeof TRAVEL_STYLES)[number];

export type Profile = {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  nationality: string | null;
  passport_country: string | null;
  country_of_residence: string | null;
  preferred_language: ProfileLanguage;
  currency: ProfileCurrency;
  home_airport: string | null;
  travel_style: TravelStyle | null;
  created_at: string;
  updated_at: string;
};

export type ProfileInput = Pick<
  Profile,
  | "name"
  | "nationality"
  | "passport_country"
  | "country_of_residence"
  | "preferred_language"
  | "currency"
  | "home_airport"
  | "travel_style"
>;
