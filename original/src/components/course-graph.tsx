"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Filter, Maximize2 } from "lucide-react";
import { Group } from "@visx/group";
import { scaleOrdinal } from "@visx/scale";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CourseGraphProps {
  courses: Course[];
  selectedCourse: Course | null;
  onSelectCourse: (course: Course | null) => void;
}

interface Node {
  id: string;
  course: Course;
  x: number;
  y: number;
}

interface Link {
  source: Node;
  target: Node;
  type: "prerequisite" | "corequisite" | "antirequisite";
}

// Show all edges when the visible graph is reasonably small. The user requested
// edges to remain visible up to 1000 nodes.
const MAX_NODES_FOR_EDGES = 1000;

// Fixed department ordering – ensures concentric layout radii remain stable even
// when the visible list of departments changes with filters.
const DEPARTMENT_ORDER = [
  "CS",
  "MATH",
  "STAT",
  "ECE",
  "PHYS",
  "CHEM",
  "BIOL",
  "ECON",
  "PSYC",
  "ENG",
];

// Assign deterministic, stable indices for departments that are not in the
// predefined list. Once a department gets an index it never changes during the
// session, guaranteeing concentric radii remain constant for already-rendered
// departments when additional ones are selected later.
const unknownDeptIndexMap = new Map<string, number>();

function getDeptRingIndex(dept: string): number {
  const knownIndex = DEPARTMENT_ORDER.indexOf(dept);
  if (knownIndex !== -1) return knownIndex;

  let idx = unknownDeptIndexMap.get(dept);
  if (idx === undefined) {
    idx = DEPARTMENT_ORDER.length + unknownDeptIndexMap.size;
    unknownDeptIndexMap.set(dept, idx);
  }
  return idx;
}

// Color scheme for different departments (aligned to the fixed order above)
const colorScale = scaleOrdinal({
  domain: DEPARTMENT_ORDER,
  range: [
    "#3b82f6",
    "#8b5cf6",
    "#ef4444",
    "#f59e0b",
    "#10b981",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#ec4899",
    "#6366f1",
  ],
});

// Normalise course ids / codes so "CS136" and "CS 136" match
const normalizeId = (s: string) => s.replace(/\s+/g, "").toUpperCase();

export function CourseGraph({ courses, selectedCourse, onSelectCourse }: CourseGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showAllEdges, setShowAllEdges] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [layoutType, setLayoutType] = useState<"hierarchical" | "force" | "grid" | "circular">(
    "circular"
  );
  const [viewport, setViewport] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(
    new Map()
  );
  const nodePositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Refs for high-performance dragging
  const draggedNodeRef = useRef<string | null>(null);
  const nodeElementsRef = useRef<Map<string, SVGGElement>>(new Map());
  const tempPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);
  const lineElementsRef = useRef<Map<string, SVGLineElement>>(new Map());

  // Calculate node positions (independent of selectedCourse for perf)
  const nodes: Node[] = useMemo(() => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    // Create nodes with different layout algorithms
    const nodes: Node[] = courses.map((course, index) => {
      let x = centerX;
      let y = centerY;

      switch (layoutType) {
        case "hierarchical": {
          // Arrange by course level (100, 200, 300, 400 level courses)
          const courseNumber = parseInt(course.code.replace(/[A-Z]/g, "")) || 100;
          const level = Math.floor(courseNumber / 100);
          const levelY = centerY - 200 + (level - 1) * 120; // Vertical layers
          const coursesInLevel = courses.filter(
            (c) => Math.floor((parseInt(c.code.replace(/[A-Z]/g, "")) || 100) / 100) === level
          );
          const indexInLevel = coursesInLevel.findIndex((c) => c.id === course.id);
          const levelWidth = Math.min(dimensions.width * 0.8, coursesInLevel.length * 80);
          const startX = centerX - levelWidth / 2;
          x = startX + indexInLevel * (levelWidth / Math.max(coursesInLevel.length - 1, 1));
          y = levelY;
          break;
        }

        case "force": {
          // Force-directed layout simulation
          const angle = (index / courses.length) * 2 * Math.PI + Math.random() * 0.5;
          const radius = 100 + Math.random() * 150;
          x = centerX + Math.cos(angle) * radius;
          y = centerY + Math.sin(angle) * radius;
          // Apply simple force-based positioning
          const repelStrength = 50;
          x += (Math.random() - 0.5) * repelStrength;
          y += (Math.random() - 0.5) * repelStrength;
          break;
        }

        case "grid": {
          // Organized grid layout
          const cols = Math.ceil(Math.sqrt(courses.length));
          const row = Math.floor(index / cols);
          const col = index % cols;
          const gridSpacing = 100;
          x = centerX - (cols * gridSpacing) / 2 + col * gridSpacing;
          y = centerY - (Math.ceil(courses.length / cols) * gridSpacing) / 2 + row * gridSpacing;
          break;
        }

        case "circular": {
          // Concentric circles by department — radius adapts to course count so nodes never overlap
          const dept = course.department;
          const deptCourses = courses.filter((c) => c.department === dept);
          // Sort courses numerically (e.g., CS 100, 115, 136, 240 …)
          const deptCoursesSorted = [...deptCourses].sort((a, b) => {
            const numA = parseInt(a.code.replace(/\D/g, "")) || 0;
            const numB = parseInt(b.code.replace(/\D/g, "")) || 0;
            return numA - numB;
          });

          // Use the fixed department order so indices – and thus radii – remain
          // consistent regardless of which departments are currently selected.
          // If a department isn't in the predefined list, push it to the end
          // in alphabetical order but *do not* affect existing ones. This keeps
          // radii for known departments stable.
          const adjustedDeptIndex = getDeptRingIndex(dept);

          const courseIndexInDept = deptCoursesSorted.findIndex((c) => c.id === course.id);

          // Dynamically size the circle: ensure a minimum arc length per node
          const MIN_ARC_PX = 60;
          const dynamicRadius = Math.max(
            120,
            (deptCoursesSorted.length * MIN_ARC_PX) / (2 * Math.PI)
          );

          // Stagger concentric circles by department index to avoid overlaps
          const circleRadius = dynamicRadius + adjustedDeptIndex * 90;

          // Place first course (smallest number) at 12 o'clock (-90°) and proceed clockwise
          const angleInCircle =
            -Math.PI / 2 + (courseIndexInDept / deptCoursesSorted.length) * 2 * Math.PI;
          x = centerX + Math.cos(angleInCircle) * circleRadius;
          y = centerY + Math.sin(angleInCircle) * circleRadius;
          break;
        }
      }

      // Add small deterministic jitter to prevent overlapping (using course ID for consistency)
      const jitter = 8;
      const seedX = course.id.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
      const seedY = course.code.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
      x += ((seedX % 100) / 100 - 0.5) * jitter;
      y += ((seedY % 100) / 100 - 0.5) * jitter;

      // Use custom position if node has been dragged, otherwise use calculated position
      const customPos = nodePositions.get(course.id);

      return {
        id: course.id,
        course,
        x: customPos?.x ?? x,
        y: customPos?.y ?? y,
      };
    });

    return nodes;
  }, [courses, layoutType, dimensions, nodePositions]);

  /* ------------------------------------------------------------------
   *  All-edges adjacency cache – built once from the *full* course list
   * ------------------------------------------------------------------ */

  // We intentionally compute from the unfiltered `courses` prop so the cache
  // remains valid when users filter later on.
  const allEdges = useMemo(() => {
    const map = new Map<
      string,
      { id: string; type: "prerequisite" | "corequisite" | "antirequisite" }[]
    >();

    courses.forEach((course) => {
      const list: { id: string; type: "prerequisite" | "corequisite" | "antirequisite" }[] = [];

      (course.prerequisites || []).forEach((pr) => {
        list.push({ id: normalizeId(pr), type: "prerequisite" });
      });

      (course.corequisites || []).forEach((cr) => {
        list.push({ id: normalizeId(cr), type: "corequisite" });
      });

      (course.antirequisites || []).forEach((ar) => {
        list.push({ id: normalizeId(ar), type: "antirequisite" });
      });

      map.set(course.id, list);
      // Also index by normalised code so lookups succeed regardless of spacing
      map.set(normalizeId(course.code), list);
    });

    return map;
  }, [courses]);

  // Calculate links separately so changing selection doesn't rebuild nodes
  const links: Link[] = useMemo(() => {
    // Build quick node lookup for current viewport
    const nodeMap = new Map<string, Node>();
    nodes.forEach((node) => {
      nodeMap.set(node.id, node);
      nodeMap.set(normalizeId(node.course.code), node);
    });

    const results: Link[] = [];

    const shouldShowAll = showAllEdges || nodes.length <= MAX_NODES_FOR_EDGES;

    const seedNodes = shouldShowAll
      ? nodes
      : selectedCourse
        ? nodes.filter((n) => n.id === selectedCourse.id)
        : [];

    seedNodes.forEach((node) => {
      const adj = allEdges.get(node.id) || [];
      adj.forEach((edgeInfo) => {
        const targetNode = nodeMap.get(edgeInfo.id);
        if (targetNode) {
          results.push({ source: targetNode, target: node, type: edgeInfo.type });
        }
      });
    });

    return results;
  }, [nodes, showAllEdges, selectedCourse, allEdges]);

  // Pre-compute nodes connected to the current selection once per click
  const connectedIds = useMemo(() => {
    if (!selectedCourse) return new Set<string>();

    const set = new Set<string>();
    set.add(selectedCourse.id);

    links.forEach((link) => {
      if (link.source.id === selectedCourse.id) {
        set.add(link.target.id);
      } else if (link.target.id === selectedCourse.id) {
        set.add(link.source.id);
      }
    });

    return set;
  }, [links, selectedCourse]);

  // Calculate visible nodes for performance (viewport culling)
  const visibleNodes = useMemo(() => {
    if (!viewport.width || !viewport.height) return nodes;

    const buffer = 100; // Extra buffer for smooth panning
    const minX = (viewport.x - buffer) / zoom - pan.x / zoom;
    const maxX = (viewport.x + viewport.width + buffer) / zoom - pan.x / zoom;
    const minY = (viewport.y - buffer) / zoom - pan.y / zoom;
    const maxY = (viewport.y + viewport.height + buffer) / zoom - pan.y / zoom;

    return nodes.filter(
      (node) => node.x >= minX && node.x <= maxX && node.y >= minY && node.y <= maxY
    );
  }, [nodes, viewport, zoom, pan]);

  // Update viewport for culling
  useEffect(() => {
    const updateViewport = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setViewport({ x: 0, y: 0, width: rect.width, height: rect.height });
      }
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    // Also react to layout shifts that don't trigger window resize (e.g., sidebar collapse)
    let ro: ResizeObserver | null = null;
    if ("ResizeObserver" in window && svgRef.current) {
      ro = new ResizeObserver(updateDimensions);
      ro.observe(svgRef.current);
    }
    return () => {
      window.removeEventListener("resize", updateDimensions);
      ro?.disconnect();
    };
  }, []);

  // Keep the ref in sync with the state on every change (lightweight)
  useEffect(() => {
    nodePositionsRef.current = nodePositions;
  }, [nodePositions]);

  // Get current position for rendering (temp position if dragging, otherwise stored/calculated)
  const getCurrentPosition = (node: Node) => {
    // If currently dragging, prefer the temp position for snappy feedback
    if (draggedNodeRef.current === node.id) {
      return tempPositionsRef.current.get(node.id) || { x: node.x, y: node.y };
    }

    // For all other scenarios, prefer the synchronously-updated ref so we
    // never see stale positions between drags (fixes MATH 239 jump-back bug)
    const stored = nodePositionsRef.current.get(node.id);
    return stored ?? { x: node.x, y: node.y };
  };

  const handleNodeClick = useCallback(
    (node: Node, e: React.MouseEvent) => {
      e.stopPropagation();
      // If the node has been moved during this interaction, treat as drag not click
      if (hasMovedRef.current) return;
      onSelectCourse(node.course);
    },
    [onSelectCourse]
  );

  // High-performance node dragging with direct DOM manipulation
  const handleNodeMouseDown = useCallback(
    (node: Node, e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent canvas panning

      if (!svgRef.current) return;

      draggedNodeRef.current = node.id;
      hasMovedRef.current = false; // Reset movement tracking

      // Store initial mouse position for drag vs click detection
      dragStartPosRef.current = { x: e.clientX, y: e.clientY };

      // Calculate initial offset from mouse to node center in graph coordinates
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;

      // Get current node position (could be custom position from previous drag)
      const currentPos = getCurrentPosition(node);

      dragOffsetRef.current = {
        x: mouseX - currentPos.x,
        y: mouseY - currentPos.y,
      };

      // Set cursor immediately for visual feedback
      document.body.style.cursor = "grabbing";

      // Initialize temp position with current position
      tempPositionsRef.current.set(node.id, { x: currentPos.x, y: currentPos.y });
    },
    [zoom, pan]
  );

  // Direct DOM manipulation for dragging (bypasses React state)
  const handleNodeMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedNodeRef.current || !svgRef.current) return;

      // Check if mouse has moved significantly from start position (drag threshold)
      const dragThreshold = 1; // Minimal threshold for immediate response
      const deltaX = Math.abs(e.clientX - dragStartPosRef.current.x);
      const deltaY = Math.abs(e.clientY - dragStartPosRef.current.y);

      if (deltaX > dragThreshold || deltaY > dragThreshold) {
        hasMovedRef.current = true; // Mark as drag, not click
        // Keep selection active while dragging
      }

      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;

      // Calculate new position with offset
      const newX = mouseX - dragOffsetRef.current.x;
      const newY = mouseY - dragOffsetRef.current.y;

      // Update temp position for immediate DOM manipulation
      tempPositionsRef.current.set(draggedNodeRef.current, { x: newX, y: newY });

      // Direct DOM manipulation for instant feedback
      const nodeElement = nodeElementsRef.current.get(draggedNodeRef.current);
      if (nodeElement) {
        const circle = nodeElement.querySelector("circle");
        const texts = nodeElement.querySelectorAll("text");

        // Ensure circle follows cursor exactly like text
        if (circle) {
          // Disable transitions during drag for immediate response
          circle.style.transition = "none";
          circle.setAttribute("cx", newX.toString());
          circle.setAttribute("cy", newY.toString());
        }

        // Position text relative to new circle position
        texts.forEach((text, index) => {
          text.style.transition = "none";
          text.setAttribute("x", newX.toString());
          text.setAttribute("y", (newY + (index === 0 ? 24 : 38)).toString());
        });
      }

      // Update connected edges in real-time
      links.forEach((link) => {
        if (link.source.id !== draggedNodeRef.current && link.target.id !== draggedNodeRef.current)
          return;
        const key = `${link.source.id}-${link.target.id}`;
        const lineEl = lineElementsRef.current.get(key);
        if (!lineEl) return;

        if (link.source.id === draggedNodeRef.current) {
          lineEl.setAttribute("x1", newX.toString());
          lineEl.setAttribute("y1", newY.toString());
        } else {
          lineEl.setAttribute("x2", newX.toString());
          lineEl.setAttribute("y2", newY.toString());
        }
      });
    },
    [zoom, pan, links]
  );

  const handleNodeMouseUp = useCallback(() => {
    if (!draggedNodeRef.current) return;

    // Restore transitions for the dragged node
    const nodeElement = nodeElementsRef.current.get(draggedNodeRef.current);
    if (nodeElement) {
      const circle = nodeElement.querySelector("circle");
      const texts = nodeElement.querySelectorAll("text");

      if (circle) {
        circle.style.transition = "";
      }
      texts.forEach((text) => {
        text.style.transition = "";
      });
    }

    // Commit temp position to React state (single update)
    const tempPos = tempPositionsRef.current.get(draggedNodeRef.current);
    if (tempPos) {
      // Create updated map once so we can synchronously update both state & ref
      const updatedMap = new Map(nodePositionsRef.current);
      updatedMap.set(draggedNodeRef.current!, tempPos);

      // Update ref immediately so subsequent interactions have fresh data
      nodePositionsRef.current = updatedMap;

      // Trigger React re-render
      setNodePositions(updatedMap);
    }

    // Clean up
    draggedNodeRef.current = null;
    tempPositionsRef.current.clear();
    document.body.style.cursor = "";

    // Delay reset so the subsequent click event (if any) still sees drag flag
    setTimeout(() => {
      hasMovedRef.current = false;
    }, 0);
  }, []);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev / 1.2, 0.1));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setNodePositions(new Map()); // Reset all custom node positions
    draggedNodeRef.current = null;
    tempPositionsRef.current.clear();
    document.body.style.cursor = "";
    hasMovedRef.current = false;
  };

  // Wheel zoom functionality with zoom-to-cursor
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      if (!svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(Math.max(zoom * delta, 0.1), 5);

      // Calculate zoom-to-cursor pan adjustment
      const zoomChange = newZoom / zoom;
      const newPanX = pan.x - (mouseX - pan.x) * (zoomChange - 1);
      const newPanY = pan.y - (mouseY - pan.y) * (zoomChange - 1);

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    },
    [zoom, pan]
  );

  // Mouse drag functionality with throttling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && !draggedNodeRef.current) {
      // Left mouse button and not dragging a node
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });

      // Keep selection active while interacting with background
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Handle node dragging first (highest priority for responsiveness)
      if (draggedNodeRef.current) {
        handleNodeMouseMove(e);
        return;
      }

      // Handle canvas panning
      if (isDragging) {
        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;

        // Only update if movement is significant (reduces re-renders)
        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
          setPan((prev) => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY,
          }));

          setLastMousePos({ x: e.clientX, y: e.clientY });
        }
      }
    },
    [isDragging, lastMousePos, handleNodeMouseMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    handleNodeMouseUp();
  }, [handleNodeMouseUp]);

  const handleMouseLeave = () => {
    setIsDragging(false);
    // Don't reset node dragging on mouse leave to allow dragging outside bounds
  };

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setLastMousePos({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastMousePos.x;
      const deltaY = touch.clientY - lastMousePos.y;

      setPan((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));

      setLastMousePos({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Add global listeners so drag still commits if pointer leaves the SVG
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      // Cast to any so we can reuse the same logic for React & native events
      handleNodeMouseMove(e as unknown as React.MouseEvent);
    };

    const handleWindowMouseUp = () => {
      handleNodeMouseUp();
    };

    const handleWindowTouchMove = (e: TouchEvent) => {
      // Prevent default to avoid scrolling while dragging on touch devices
      e.preventDefault();
      // We only support single-touch dragging for now
      if (e.touches.length === 1) {
        handleNodeMouseMove({
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY,
        } as unknown as React.MouseEvent);
      }
    };

    const handleWindowTouchEnd = () => {
      handleNodeMouseUp();
      setIsDragging(false);
    };

    // Attach listeners once – internal logic early-returns if no node is being dragged.
    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
    window.addEventListener("touchmove", handleWindowTouchMove, { passive: false });
    window.addEventListener("touchend", handleWindowTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
      window.removeEventListener("touchmove", handleWindowTouchMove);
      window.removeEventListener("touchend", handleWindowTouchEnd);
    };
  }, [handleNodeMouseMove, handleNodeMouseUp]);

  const getNodeColor = (node: Node) => {
    if (selectedCourse) {
      if (node.course.id === selectedCourse.id) return "#2563eb";
      return connectedIds.has(node.id) ? "#3b82f6" : "#94a3b8";
    }
    return colorScale(node.course.department) || "#64748b";
  };

  return (
    <div
      className={`relative h-full w-full bg-gradient-to-br from-slate-50 to-blue-50 ${isFullscreen ? "fixed inset-0 z-50" : ""}`}
    >
      <motion.svg
        ref={svgRef}
        className={`h-full w-full ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Group transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrow-blue"
              markerWidth="12"
              markerHeight="8"
              refX="11"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0 0, 12 4, 0 8" fill="#3b82f6" />
            </marker>
            <marker
              id="arrow-green"
              markerWidth="12"
              markerHeight="8"
              refX="11"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0 0, 12 4, 0 8" fill="#22c55e" />
            </marker>
            <marker
              id="arrow-orange"
              markerWidth="12"
              markerHeight="8"
              refX="11"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0 0, 12 4, 0 8" fill="#f97316" />
            </marker>
            <marker
              id="arrow-gray"
              markerWidth="12"
              markerHeight="8"
              refX="11"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0 0, 12 4, 0 8" fill="#6b7280" />
            </marker>
          </defs>

          {/* Render links (static for better performance) */}
          {links.map((link, index) => {
            const srcPos = getCurrentPosition(link.source as unknown as Node);
            const tgtPos = getCurrentPosition(link.target as unknown as Node);
            const isHighlighted =
              selectedCourse &&
              (link.source.id === selectedCourse.id || link.target.id === selectedCourse.id);
            const baseColor =
              link.type === "prerequisite"
                ? "#3b82f6"
                : link.type === "corequisite"
                  ? "#22c55e"
                  : "#6b7280";
            return (
              <line
                ref={(el) => {
                  const key = `${link.source.id}-${link.target.id}`;
                  if (el) lineElementsRef.current.set(key, el);
                  else lineElementsRef.current.delete(key);
                }}
                key={`${link.source.id}-${link.target.id}-${index}`}
                x1={srcPos.x}
                y1={srcPos.y}
                x2={tgtPos.x}
                y2={tgtPos.y}
                stroke={baseColor}
                strokeWidth={isHighlighted ? 3 : 1.5}
                strokeOpacity={selectedCourse ? (isHighlighted ? 0.9 : 0.12) : 0.6}
                markerEnd={
                  link.type === "prerequisite"
                    ? "url(#arrow-blue)"
                    : link.type === "corequisite"
                      ? "url(#arrow-green)"
                      : "url(#arrow-gray)"
                }
              />
            );
          })}

          {/* Render visible nodes only */}
          {visibleNodes.map((node) => {
            const currentPos = getCurrentPosition(node);
            return (
              <g
                key={node.id}
                ref={(el) => {
                  if (el) {
                    nodeElementsRef.current.set(node.id, el);
                  } else {
                    nodeElementsRef.current.delete(node.id);
                  }
                }}
                style={{ cursor: draggedNodeRef.current === node.id ? "grabbing" : "grab" }}
                onClick={(e) => handleNodeClick(node, e)}
                onMouseDown={(e) => handleNodeMouseDown(node, e)}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <circle
                  cx={currentPos.x}
                  cy={currentPos.y}
                  r={node.course.id === selectedCourse?.id ? 12 : 9}
                  fill={getNodeColor(node)}
                  stroke="#fff"
                  strokeWidth={2}
                  className="transition-colors duration-200"
                />
                {/* Course code - visible when moderately zoomed in */}
                {zoom > 0.7 && (
                  <text
                    x={currentPos.x}
                    y={currentPos.y + 24}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#374151"
                    className="pointer-events-none select-none font-medium"
                    opacity={Math.min((zoom - 0.7) / 0.3, 1)} // Fade in effect
                  >
                    {node.course.code}
                  </text>
                )}

                {/* Course name - visible when highly zoomed in */}
                {zoom > 1.5 && (
                  <text
                    x={currentPos.x}
                    y={currentPos.y + 38}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#6b7280"
                    className="pointer-events-none select-none"
                    opacity={Math.min((zoom - 1.5) / 0.5, 1)} // Fade in effect
                  >
                    {node.course.name?.length > 20
                      ? `${node.course.name.substring(0, 20)}...`
                      : node.course.name || ""}
                  </text>
                )}
              </g>
            );
          })}
        </Group>
      </motion.svg>

      {/* Modern Controls */}
      <div className="absolute bottom-6 left-6 flex items-center space-x-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center space-x-2 rounded-xl bg-white/90 backdrop-blur-sm p-3 shadow-lg border border-white/20"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            title="Reset View"
            aria-label="Reset View"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                title="Filter & Layout"
                aria-label="Filter and Layout"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setShowAllEdges(!showAllEdges)}>
                {showAllEdges ? "Hide All Edges" : "Show All Edges"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLayoutType("hierarchical")}>
                📚 Hierarchical Layout
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLayoutType("force")}>
                🌐 Force-Directed Layout
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLayoutType("grid")}>
                📋 Grid Layout
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLayoutType("circular")}>
                🎯 Circular Layout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center space-x-4 rounded-xl bg-white/90 backdrop-blur-sm p-3 shadow-lg border border-white/20"
        >
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-sm font-medium">Prerequisites</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium">Corequisites</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-gray-500" />
            <span className="text-sm font-medium">Antirequisites</span>
          </div>
        </motion.div>
      </div>

      {/* Performance indicator */}
      <div className="absolute top-4 right-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.2 }}
          className="rounded-lg bg-white/90 backdrop-blur-sm px-3 py-2 shadow-lg border border-white/20"
        >
          <div className="text-xs text-gray-600 font-medium">
            {visibleNodes.length}/{nodes.length} nodes • {links.length} edges
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {layoutType.charAt(0).toUpperCase() + layoutType.slice(1)} Layout • Zoom:{" "}
            {zoom.toFixed(1)}x
          </div>
          <div className="text-xs text-gray-500">Scroll to zoom • Click & drag to pan</div>
        </motion.div>
      </div>
    </div>
  );
}
