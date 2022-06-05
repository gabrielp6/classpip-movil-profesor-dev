import { Component, AfterViewInit, Input, ViewChild,  ElementRef, Renderer2 } from "@angular/core";
@Component({
  selector: "app-expandable",
  templateUrl: "./expandable2.component.html",
  styleUrls: ["./expandable2.component.scss"]
})
export class ExpandableComponent2 implements AfterViewInit {
  @ViewChild("expandWrapper", {
  read: ElementRef,
  static: false
}) expandWrapper: ElementRef;
  @Input("expanded") expanded: boolean = false;
  @Input("expandHeight") expandHeight: string = "150px";
  constructor(public renderer: Renderer2) {}
  ngAfterViewInit() {
    this.renderer.setStyle(this.expandWrapper.nativeElement, "max-height", this.expandHeight);
  }
}