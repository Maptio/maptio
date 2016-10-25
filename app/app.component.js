"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var AppComponent = (function () {
    function AppComponent(element /*, d3Service: D3Service*/) {
        //this.d3 = d3Service.getD3(); // <-- obtain the d3 object from the D3 Service
        this.htmlElement = element.nativeElement;
    }
    AppComponent.prototype.ngOnInit = function () {
        //let d3 = this.d3; 
    };
    AppComponent.prototype.ngAfterViewInit = function () {
        console.log("ngAfterViewInit");
        this.htmlElement = this.element.nativeElement;
        //this.host        = this.d3.select(this.htmlElement);
        this.setup();
    };
    AppComponent.prototype.onRefreshGraph = function () {
    };
    AppComponent.prototype.setup = function () {
        console.log("Setup");
        // var svg = d3.select("svg"),
        // margin = 20,
        // diameter = +svg.attr("width"),
        // g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
        // var color = d3.scaleOrdinal()
        //     //.domain([-1, 5])
        //     .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"]);
        //     //.interpolate(d3interpolate.interpolateHcl);
        // var pack = d3.pack()
        //     .size([diameter - margin, diameter - margin])
        //     .padding(2);
    };
    __decorate([
        core_1.ViewChild('container'), 
        __metadata('design:type', core_1.ElementRef)
    ], AppComponent.prototype, "element", void 0);
    AppComponent = __decorate([
        core_1.Component({
            selector: 'my-app',
            moduleId: module.id,
            templateUrl: './app.component.html',
            styles: ['./app.component.css']
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map