import Lottie from "lottie-react";
import animationData from "../../../assets/logoLottie.json";

export default function IconLogo() {
  return (
    <Lottie
      animationData={animationData}
      autoplay={true}
      style={{ width: "36px", height: "36px" }}
      loop={false}
    />
  );
}
