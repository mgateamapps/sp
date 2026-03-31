import Link from "next/link";
import Image from "next/image";
import LogoWide from "@/public/assets/images/logo_wide.png";

function ThemeLogo() {
  return (
    <Link href="/">
      <Image
        src={LogoWide}
        alt="ScorePrompt"
        width={168}
        height={40}
        priority
      />
    </Link>
  );
}

export default ThemeLogo;
