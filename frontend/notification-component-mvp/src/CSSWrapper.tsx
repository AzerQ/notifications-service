import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

export default function CSSWrapper({
                                       cssHref,
                                       children,
                                   }: {
    cssHref: string;
    children: React.ReactNode;
}) {
    const hostRef = useRef<HTMLDivElement>(null);
    const [mountNode, setMountNode] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (hostRef.current && !mountNode) {
            const shadow = hostRef.current.attachShadow({mode: 'open'});

            // Внедряем CSS для основного компонента
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssHref;
            shadow.appendChild(link);

            const container = document.createElement('div');
            shadow.appendChild(container);
            setMountNode(container);
        }
    }, [cssHref, mountNode]);

    return <div ref={hostRef}>{mountNode ? ReactDOM.createPortal(children, mountNode) : null}</div>;
}