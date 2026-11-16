// Every dedicated game page, newest game first. Add a page: write its file in game-page-content/ and list it here.
import { GTA_3_PAGE } from "@/constants/gta/game-page-content/gta-3";
import { GTA_4_PAGE } from "@/constants/gta/game-page-content/gta-4";
import { GTA_5_PAGE } from "@/constants/gta/game-page-content/gta-5";
import { GTA_6_PAGE } from "@/constants/gta/game-page-content/gta-6";
import { GTA_SAN_ANDREAS_PAGE } from "@/constants/gta/game-page-content/gta-san-andreas";
import { GTA_VICE_CITY_PAGE } from "@/constants/gta/game-page-content/gta-vice-city";

import type { GamePage } from "@/lib/seo/game-page-types";

export const GAME_PAGES: GamePage[] = [
	GTA_6_PAGE,
	GTA_5_PAGE,
	GTA_4_PAGE,
	GTA_SAN_ANDREAS_PAGE,
	GTA_VICE_CITY_PAGE,
	GTA_3_PAGE,
];
