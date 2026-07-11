"use client";

/**
 * T.5b — Picture-in-Picture for a real `<video>` element (the standard,
 * broadly-supported `HTMLVideoElement.requestPictureInPicture()` API —
 * used for the real WebRTC online-class video stage, where a genuine
 * `<video>` element already exists, as opposed to NEYO Intercom's
 * audio-only call UI which uses the separate Document PiP hook instead).
 */
import * as React from "react";

export function useVideoPictureInPicture(videoRef: React.RefObject<HTMLVideoElement>) {
  const [supported, setSupported] = React.useState(false);
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    setSupported(typeof document !== "undefined" && "pictureInPictureEnabled" in document);
  }, []);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnter = () => setActive(true);
    const onLeave = () => setActive(false);
    video.addEventListener("enterpictureinpicture", onEnter);
    video.addEventListener("leavepictureinpicture", onLeave);
    return () => {
      video.removeEventListener("enterpictureinpicture", onEnter);
      video.removeEventListener("leavepictureinpicture", onLeave);
    };
  }, [videoRef]);

  const toggle = React.useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      // Real, honest silent failure — some browsers block PiP without a
      // direct user gesture on the video itself; never crash the room.
    }
  }, [videoRef]);

  return { supported, active, toggle };
}
