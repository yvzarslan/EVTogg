"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const PENDING_SCROLL_KEY = "ev-platform-pending-scroll";

function scrollToTarget(targetId) {
  document.getElementById(targetId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export default function ScrollLink({ targetId, onClick, children, ...props }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname !== "/") return;

    const pendingTarget = sessionStorage.getItem(PENDING_SCROLL_KEY);
    if (!pendingTarget) return;

    sessionStorage.removeItem(PENDING_SCROLL_KEY);
    requestAnimationFrame(() => scrollToTarget(pendingTarget));
  }, [pathname]);

  const handleClick = (event) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();

    if (pathname === "/") {
      sessionStorage.removeItem(PENDING_SCROLL_KEY);
      scrollToTarget(targetId);
      return;
    }

    sessionStorage.setItem(PENDING_SCROLL_KEY, targetId);
    router.push("/");
  };

  return (
    <Link href="/" onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
