import { StaticImageData } from "next/image";
import audi from "../assets/brands/audi-logo-2016-download.png";
import bmw from "../assets/brands/bmw-logo-2020-gray-download.png";
import mercedes from "../assets/brands/Mercedes-Benz-logo-2011-1920x1080.png";
import volkswagen from "../assets/brands/Volkswagen-logo-2019-1500x1500.png";
import nissan from "../assets/brands/nissan-logo-2020-black.png";

export const brandLogos: Record<string, StaticImageData> = {
  Audi: audi,
  BMW: bmw,
  Mercedes: mercedes,
  Volkswagen: volkswagen,
  Nissan: nissan,
};
