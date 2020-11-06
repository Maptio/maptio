import { Router, ActivatedRoute } from "@angular/router";

import { Initiative } from "../../../../shared/model/initiative.data";

import { MappingZoomableComponent, d3 } from "./mapping.zoomable.component";


export function hydrate(root: any, nodes: any[], component: MappingZoomableComponent) {
    const svg = d3.select("svg");
    const g = d3.select("svg > g");
    const margin = 20;
    const height = component.height;
    const width = component.width;
    const TRANSITION_DURATION = component.TRANSITION_DURATION;
    const showToolipOf$ = component.showToolipOf$;
    const showContextMenuOf$ = component.showContextMenuOf$;
    const canOpenInitiativeContextMenu = component.permissionsService.canOpenInitiativeContextMenu();
    const toggleDetailsPanel$ = component.toggleDetailsPanel$;
    const selectableUsers$ = component.selectableUsers$;
    const zoom$ = component.zoom$;
    const uiService = component.uiService;
    const router: Router = component.router;
    const route: ActivatedRoute = component.route;
    let zoomInitiativeSubscription = component.zoomInitiativeSubscription;
    let manualZoomSubscription = component.manualZoomSubscription;
    let view: any;
    let lastZoomCircle = component.lastZoomCircle;
    let setIsShowMission = component.setIsShowMission.bind(component);
    const node = g.selectAll("g.node").data(nodes, function (d: any) { return d ? d.data.id : d3.select(this).attr("id") || null });
    const circle = g.selectAll("circle.node").data(nodes, function (d: any) { return d ? d.data.id : d3.select(this).attr("id") || null });;
    const text = g.selectAll("foreignObject.name").data(nodes, function (d: any) { return d ? d.data.id : d3.select(this).attr("id") || null });;
    // const memberImages = g.selectAll("foreignObject.name span.member-picture").data(nodes, function (d: any) { return d ? d.data.id : d3.select(component).attr("id") || null });;

    d3.select("body").select("div.tooltip.member").remove();
    let tooltipUser = d3.select("body").append("div");
    tooltipUser.attr("class", "member tooltip").style("opacity", 0);
    d3.select("body").select("div.tag.tooltip").remove();
    let tooltipTag = d3.select("body").append("div");
    tooltipTag.attr("class", "tag tooltip").style("opacity", 0);


    text.each(function (dtext: any) {
      d3.select(this).selectAll("span.member-picture")
        .on("click", (d: any, index: number, elements: Array<HTMLElement>) => {

          let shortId = elements[index].getAttribute("data-member-shortid");
          let user = (<Initiative>dtext.data).getAllParticipants().filter(u => u.shortid === shortId)[0];
          localStorage.removeItem("node_id");
          localStorage.setItem("user_id", user.shortid);
          selectableUsers$.next([user]);
          showToolipOf$.next({ initiatives: null, user: user });
          // document.querySelector("#controls-box").classList.add("show");


          // router.navigate(["../directory"], { relativeTo: route, queryParams: { member: shortId } });
          d3.getEvent().stopPropagation();
        })
        .on("mouseover", (d: any, index: number, elements: Array<HTMLElement>) => {
          let name = elements[index].getAttribute("data-member-name");
          tooltipUser.text(name);
          tooltipUser
            .style("opacity", 1).style("left", (d3.getEvent().pageX) + "px")
            .style("top", (d3.getEvent().pageY - 28) + "px")
            .style("pointer-events", "none")
        })
        .on("mouseout", (d: any, index: number, elements: Array<HTMLElement>) => {
          let name = elements[index].getAttribute("data-member-name");
          tooltipUser.text(name);
          tooltipUser.style("opacity", 0);
        })

      d3.select(this).selectAll("span.tag-line")
        .on("mouseover", (d: any, index: number, elements: Array<HTMLElement>) => {
          let name = elements[index].getAttribute("data-tag-name");
          tooltipTag.text(name);
          tooltipTag
            .style("opacity", 1).style("left", (d3.getEvent().pageX) + "px")
            .style("top", (d3.getEvent().pageY - 28) + "px")
            .style("pointer-events", "none")
        })
        .on("mouseout", (d: any, index: number, elements: Array<HTMLElement>) => {
          let name = elements[index].getAttribute("data-tag-name");
          tooltipTag.text(name);
          tooltipTag.style("opacity", 0);
        })
    })

    svg.style("position", "relative")
    // svg.style("padding-left", `calc(65% - ${component.height / 2}px)`);

    const wheelDelta = () => -d3.getEvent().deltaY * (d3.getEvent().deltaMode ? 120 : 1) / 500 * 10.5;
    const zooming = d3
      .zoom()
      .scaleExtent([1, 10])
      .wheelDelta(wheelDelta)
      .on("zoom", zoomed);

    function zoomed() {
      g.attr("transform", d3.getEvent().transform);
    }

    function passingThrough(el: any, eventName: string) {
      if (eventName == "contextmenu") {
        el.on("contextmenu", function (d: any): void {
          d3.getEvent().preventDefault();
          let mouse = d3.mouse(this);
          d3.select(`circle.node[id="${d.data.id}"]`).dispatch("contextmenu", { bubbles: true, cancelable: true, detail: { position: [mouse[0], mouse[1]] } });
        })
      } else {
        el
          .on(eventName, function (d: any): void {
            d3.select(`circle.node[id="${d.data.id}"]`).dispatch(eventName);
          })
      }
    }

    function getViewScaleForRadius(radius: number): number {
      return (height) / (radius * 2 + margin);
    }

    function getClickedElementCoordinates(clickedElement: any, newScale: number, translateX: number, translateY: number): Array<number> {

      let clickedX = 0;
      let clickedY = 0;
      if (
        clickedElement
        && clickedElement.transform
        && (clickedElement.transform.baseVal.length > 0 || clickedElement.transform.baseVal.numberOfItems > 0)
      ) {
        clickedX = clickedElement.transform.baseVal.getItem(0).matrix.e * newScale;
        clickedY = clickedElement.transform.baseVal.getItem(0).matrix.f * newScale;
        clickedX -= margin;
        clickedY -= margin;
      }
      else {
        // in case we are zooming prgramatically and the svg doesnt have the reference to transform

        clickedX = translateX * newScale;
        clickedY = translateY * newScale;
        clickedX -= margin;
        clickedY -= margin;
      }
      return [clickedX, clickedY];
    }

    function initMapElementsAtPosition(v: any) {
      view = v;
      node
        .style("opacity", 0)
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("transform", (d: any): string => `translate(${d.x - v[0]}, ${d.y - v[1]})`)
        .style("opacity", 0)
        .transition()
        .duration(TRANSITION_DURATION / 5)
        .style("opacity", function (d: any) {
          return localStorage.getItem("node_id") && d.parent && d.parent.data.id.toString() === localStorage.getItem("node_id").toString()
            ? 0.15
            : "initial";
        })
        .each((d: any) => (d.translateX = d.x - v[0]))
        .each((d: any) => (d.translateY = d.y - v[1]))

      text
        .style("opacity", function (d: any) {
          console.log(d.data.name, d.data.id, localStorage.getItem("node_id"))
          if(!localStorage.getItem("node_id")){
            // whole map visible
            return !d.children ? 1 : 0;
          }
          return d.data.id.toString() === localStorage.getItem("node_id").toString()
            ? 1
            : d.parent && d.parent.data.id.toString() === localStorage.getItem("node_id").toString()
              ? 1
              : !d.children
                ? 1
                : 0;
        })
        .style("font-weight", function (d: any) {
          if(!localStorage.getItem("node_id")){
            // whole map visible
            return "unset";
          }
          return d.data.id.toString() === localStorage.getItem("node_id").toString()
            ? "bold"
            : "unset"
        })
        .on("click", function (d: any) {
          d3.select(`circle.node[id="${d.data.id}"]`).dispatch("click")
          d3.getEvent().stopPropagation();
        })
        .call(passingThrough, "contextmenu");

      circle
        .attr("r", function (d: any) {
          return d.r;
        })

    }

    function zoom(focus: any, clickedElement?: any): void {
      lastZoomCircle = focus;

      const newScale: number = focus === root /*|| focus.parent === root*/ ? 1 : getViewScaleForRadius(focus.r);
      const coordinates: Array<number> = getClickedElementCoordinates(clickedElement, newScale, focus.translateX, focus.translateY);
      svg.transition().duration(TRANSITION_DURATION).call(
        <any>zooming.transform,
        d3.zoomIdentity.translate(
          view[0] - coordinates[0],
          view[1] - coordinates[1]
        )
          .scale(newScale)
      );

      console.log("focus", focus.data.id, focus.data.name)
      node
        .style("pointer-events", function (d: any) {
          if (d === root) return "visible";
          if (d === focus || d.parent === focus || focus.parent === d.parent || focus.parent === d) return "all";
          return "none";
        })
        .on("mouseenter", function (d: any) {
          d3.select(this)
            .classed("focused", true)
            .style("opacity", d === focus ? "unset" : d.parent === focus ? 1 : "initial");
        })
        .on("mouseleave", function (d: any) {
          d3.select(this).select("foreignObject")
            .style("opacity", 1)
        });

      d3.selectAll(`[id="${focus.data.id}"]`)
        .on("mouseenter", function (d: any) {
          d3.select(this).select("foreignObject").style("opacity", 0);
          d3.selectAll(`[parent-id="${focus.data.id}"]`)
            .style("opacity", "unset")
        })
        .on("mouseleave", function (d: any) {
          console.log("circle mouseleave", focus.data.id)
          d3.select(this).select("foreignObject").style("opacity", 1).style("font-weight", "bold")
          d3.selectAll(`[parent-id="${focus.data.id}"]`)
            .style("opacity", 0.15)
        });

      d3.selectAll(`[parent-id="${focus.data.id}"]`)
        .on("mouseover", function (d: any) {
          g.selectAll(`[id="${focus.data.id}"] > foreignObject`).style("opacity", 0)
          d3.getEvent().stopPropagation();
        });

      circle
        .transition().duration(TRANSITION_DURATION / 2)
        .style("opacity", function (d: any) {
          if (d === focus || d.parent === focus) return 1;
          return 0.15;
        })
        .attr("k", newScale)

      text
        .transition().duration(TRANSITION_DURATION / 2)
        .style("display", function (d: any) {
          if (d === root) return "none";
          return d.parent === focus || d === focus || focus.parent === d.parent ? "inline"
            : "none"
        })
        // .style("opacity", function (d: any) {
        //   return d === focus && d.children ? 0 : 1;
        // })
        .style("pointer-events", function (d: any) {
          return "none"; //d === focus && d.children ? "none" : "visible";
        });
    }

    circle
      .on("click", function (d: any, index: number, elements: Array<HTMLElement>): void {
        showToolipOf$.next({ initiatives: [d.data], user: null });
        localStorage.removeItem("user_id");
        localStorage.removeItem("keepEditingOpen");

        node.classed("highlighted", false);
        if (lastZoomCircle.data.id === d.data.id) { //zoom out
          lastZoomCircle = root;
          zoom(root);

          localStorage.removeItem("node_id");
          setIsShowMission(true);

        } else { //zoom in
          lastZoomCircle = d;
          localStorage.setItem("node_id", d.data.id)
          zoom(d, (<any>component).parentElement);
          // setIsShowMission(false);

        }

        d3.getEvent().stopPropagation();
      })
      .on("contextmenu", function (d: any) {
        if (!canOpenInitiativeContextMenu) return;

        d3.getEvent().preventDefault();
        const that = <any>component;
        let mousePosition;

        if (Number.isNaN(d3.mouse(that)[0]) || Number.isNaN(d3.mouse[1])) {
          mousePosition = d3.getEvent().detail.position
        }
        else {
          mousePosition = d3.mouse(that);
        }

        let k = Number.parseFloat(d3.select(that).attr("k"));
        let padding = (width * .60 - height / 2) / k;

        let matrix = that.getCTM().translate(
          +that.getAttribute("cx"),
          +that.getAttribute("cy")
        );

        let mouse = { x: mousePosition[0] + padding, y: mousePosition[1] }
        let initiative = d.data;
        let circle = d3.select(that);
        showContextMenuOf$.next({
          initiatives: [initiative],
          x: uiService.getContextMenuCoordinates(mouse, matrix).x,
          y: uiService.getContextMenuCoordinates(mouse, matrix).y,
          isReadOnlyContextMenu: false,
          canDelete: d !== root
        });

        d3.select(".context-menu")
          .on("mouseenter", () => {
            showContextMenuOf$.next({
              initiatives: [initiative],
              x: uiService.getContextMenuCoordinates(mouse, matrix).x,
              y: uiService.getContextMenuCoordinates(mouse, matrix).y,
              isReadOnlyContextMenu: false,
              canDelete: d !== root
            });
            circle.dispatch("mouseover");
          })
          .on("mouseleave", () => {
            showContextMenuOf$.next({
              initiatives: null,
              x: 0,
              y: 0,
              isReadOnlyContextMenu: false,
              canDelete: d !== root
            });
            circle.dispatch("mouseout");
          })
      })
    // .on("mouseout", (d: any) => {
    //   setTimeout(() => {
    //     showContextMenuOf$.next({
    //       initiatives: null,
    //       x: 0,
    //       y: 0,
    //       isReadOnlyContextMenu: false,
    //       canDelete: d !== root
    //     });
    //   }, 400);

    // });

    lastZoomCircle = root;
    svg
      .on("click", (): void => {
        localStorage.removeItem("node_id");
        if (!localStorage.getItem("user_id")) {
          toggleDetailsPanel$.next(false);
        }
        // if (!localStorage.getItem("user_id")) {
        //   showToolipOf$.next({ initiatives: [root.data], user: null });
        // }
        zoom(root);
        if (!localStorage.getItem("user_id") && !localStorage.getItem("node_id")) {
          showToolipOf$.next({ initiatives: null, user: null })
        }

        // setIsShowMission(true);
        d3.getEvent().stopPropagation();
      })

    g.on("mouseleave", function (d: any) {
      if (localStorage.getItem("node_id")) {
        console.log("g mouseleave", localStorage.getItem("node_id"))
        d3.selectAll(`[id="${localStorage.getItem("node_id")}"]`).dispatch("mouseleave")
      }
    })

    initMapElementsAtPosition([root.x, root.y])

    try {
      // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)

      svg.call(
        zooming.transform,
        d3.zoomIdentity
          // .translate(width / 2, height / 2 )
          .scale(1)
      );
      svg.call(zooming);
    } catch (error) { console.error(error); }

    if (localStorage.getItem("node_id")) {

      let id = localStorage.getItem("node_id");
      if (lastZoomCircle.data.id.toString() === id.toString()) return;
      svg.select(`circle.node[id="${id}"]`).dispatch("click");
    } else {


      svg.dispatch("click");
    }



    zoomInitiativeSubscription = component.zoomInitiative$.asObservable().subscribe(zoomedNode => {

      if (!zoomedNode) {
        svg.dispatch("click");
        return;
      }

      let zoomedId = zoomedNode.id;
      let parent = nodes.find(n => n.data.id === zoomedId) ? nodes.find(n => n.data.id === zoomedId).parent : root;
      localStorage.setItem("node_id", zoomedId.toString());

      if (parent.data.id === root.data.id && isEmpty(zoomedNode.children)) {
        svg.select(`circle.node[id="${zoomedId.toString()}"]`).dispatch("click");
      }
      else {
        if (lastZoomCircle.data.id !== parent.data.id) {
          svg.select(`circle.node[id="${parent.data.id}"]`).dispatch("click");
        }
      }


      node.classed("highlighted", false);
      svg.select(`g.node[id="${zoomedId}"]`).classed("highlighted", true);
      showToolipOf$.next({ initiatives: [zoomedNode], user: null });

    });

    manualZoomSubscription = component.zoom$.subscribe((factor: number) => {
      zooming.scaleBy(<any>svg.transition().duration(TRANSITION_DURATION / 2), factor);
    });
}
