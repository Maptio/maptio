import { Injectable, OnInit } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject'

import 'rxjs/add/operator/map'

@Injectable()
export class DataService {


    private DATA:string = `
    {
 "name": "Hierarchy","description":"",
 "children": [
  {
    "name":"Company", "description":"Lorem ipsum dolor sit amet, vestibulum magna amet odio, commodo quam, iaculis magnis ea vestibulum at neque id, fringilla elit, nec ultrices pharetra at et ipsum vehicula. Sodales eget vulputate wisi dui eget, fringilla et massa erat gravida laoreet, id animi justo, morbi velit vivamus, lacinia et justo non. Ante faucibus, non vitae ac, sed eleifend odio eos nisl, orci metus nonummy donec sed, sodales sit et. Aliquam mi dolor pharetra, augue viverra lobortis erat ligula, sed tempor, duis justo mauris bibendum. Interdum convallis.",
    "children":[
        {"name":"Accounting", "size":"200", "description":"Consectetuer magna pulvinar dolor felis sed, curabitur vitae eu. Nec et elit tincidunt vivamus eget ultricies, blandit nulla facilisis vestibulum id arcu pretium, eu congue, cursus neque enim, elit dis amet aut felis odio. Etiam ac dolor at, pede odio sit. Adipiscing ante, massa at risus arcu sed in. Scelerisque malesuada, commodo in, vivamus tortor neque sollicitudin sed, enim ac iaculis ultricies elementum pede, quis magna. Nunc metus id eleifend commodo vulputate. Vitae imperdiet et, expedita luctus dui, amet duis lacus, nec volutpat tortor. Nonummy tristique nascetur malesuada id ut, justo urna enim convallis erat sit at, fermentum lectus tincidunt non nonummy urna, nostra eu dolor id consequat. Morbi sit risus vel pede non convallis, nonummy dui lorem quisque, quam congue penatibus eget, odio eleifend gravida non nascetur eget, amet rhoncus sed."},
        {"name":"Human Ressources", "size":"100", "description":"Eget elit ut placerat in, velit eaque adipiscing auctor curabitur wisi enim, donec sagittis ipsum ullamcorper molestie hendrerit, donec luctus condimentum. Justo libero pharetra sed, ultrices dui at libero sed purus, porro iaculis vivamus placerat. Placerat orci elit est. At dui a sollicitudin posuere id elementum, lacus dis orci viverra nunc pellentesque, fusce gravida montes integer urna dignissim ad. Vivamus justo nisl dui ipsum, beatae feugiat volutpat, lobortis erat ac luctus, mattis odio in ut tellus phasellus. Donec laoreet felis sem, magna rhoncus dolor volutpat eu consequat quam. Neque at dui et eu ac, nisl aliquet, donec mauris sagittis praesent eu ac magna, pellentesque mollis. Pharetra ligula a, integer velit pulvinar nec, enim nulla class augue, nibh lacus sodales lorem, in vel mi eu etiam."},
        {
            "name":"Engineering","description":"Lobortis non cras orci gravida dolor orci, wisi proin accumsan duis quam lectus, gravida aliquam vestibulum leo aliquam sed inceptos, pede fusce, metus consectetuer metus. Viverra ac, ac molestie at, ultrices tellus a nonummy curae quam, quam id interdum mauris nunc, eu et rhoncus risus interdum vestibulum porta. Libero auctor, ut pellentesque, velit commodo pretium pharetra, hac blandit lectus dolor malesuada lorem. Ipsum ultrices quam dolor pede justo, feugiat auctor bibendum turpis semper venenatis donec, etiam condimentum, ac lacinia libero. Est quam dignissim sodales tincidunt in, orci vel nullam aliquet quis tellus. In ac urna fermentum quis sem. Arcu nibh et molestie vitae suspendisse, leo sem massa. Luctus lacus, viverra nunc, vestibulum donec eget proin, libero mollis nulla velit. Ut ut magna. Morbi dignissim a fusce volutpat, pellentesque nulla venenatis in lorem, cursus lobortis libero quis tempus quam, consectetuer bibendum, et pede vulputate wisi. Tempus ut accumsan tortor id integer, dignissim ut convallis platea sed urna sit. A mattis sodales nulla nulla vitae.",
            "children":[
                {"name":"Front-End", "size":"50", "description":"Lobortis non cras orci gravida dolor orci, wisi proin accumsan duis quam lectus, gravida aliquam vestibulum leo aliquam sed inceptos, pede fusce, metus consectetuer metus. Viverra ac, ac molestie at, ultrices tellus a nonummy curae quam, quam id interdum mauris nunc, eu et rhoncus risus interdum vestibulum porta. Libero auctor, ut pellentesque, velit commodo pretium pharetra, hac blandit lectus dolor malesuada lorem. Ipsum ultrices quam dolor pede justo, feugiat auctor bibendum turpis semper venenatis donec, etiam condimentum, ac lacinia libero. Est quam dignissim sodales tincidunt in, orci vel nullam aliquet quis tellus. In ac urna fermentum quis sem. Arcu nibh et molestie vitae suspendisse, leo sem massa. Luctus lacus, viverra nunc, vestibulum donec eget proin, libero mollis nulla velit. Ut ut magna. Morbi dignissim a fusce volutpat, pellentesque nulla venenatis in lorem, cursus lobortis libero quis tempus quam, consectetuer bibendum, et pede vulputate wisi. Tempus ut accumsan tortor id integer, dignissim ut convallis platea sed urna sit. A mattis sodales nulla nulla vitae."
                , "children":[
                    {"name":"CSS", "size":"10"},
                    {"name":"SVG", "size":"10"},
                    {"name":"MEAN", "size":"10"},
                    {"name":"ASP.NET", "size":"10", "children":[
                        {"name":"CSS", "size":"10"},
                        {"name":"CSS", "size":"10"},
                        {"name":"CSS", "size":"10"},
                        {"name":"CSS", "size":"10"},
                        {"name":"CSS", "size":"10", "children":[
                            {"name":"CSS", "size":"10"},
                            {"name":"CSS", "size":"10"},
                            {"name":"CSS", "size":"10"},
                            {"name":"CSS", "size":"10","children":[
                            {"name":"CSS", "size":"10"},
                            {"name":"CSS", "size":"10"},
                            {"name":"CSS", "size":"10"},
                            {"name":"CSS", "size":"10","children":[
                            {"name":"CSS", "size":"10"},
                            {"name":"CSS", "size":"10"},
                            {"name":"CSS", "size":"10"},
                            {"name":"CSS", "size":"10"}]
                        }]}
                        ]}
                    ]}

                ]
        
                },
                {"name":"Data", "size":"100", "description":"Nibh vitae massa, mi in nulla pellentesque. Vel sit non commodo. Ac eius. Blandit in elit, wisi erat cras arcu, cras ultrices mauris arcu tincidunt elit sit. Risus justo libero non exercitation. Odio cursus lectus ac, vel penatibus libero tristique suscipit rutrum curabitur, adipiscing nec nihil, enim egestas adipiscing. Interdum vitae, mi auctor ut erat in commodo ante, ornare pretium, dolor sit turpis mollis parturient nunc, a eu porttitor magna hac ullamcorper dictum. Nullam nullam libero id pede. Id lacus, in mauris at ac rutrum vestibulum sollicitudin. Mauris quo ut, augue aenean enim, turpis non nam sit dolorem duis, magna primis orci cras vestibulum, dui mauris porttitor ut. Libero maecenas facilisi amet, erat facilisis dolores orci ut elementum porta, neque placerat etiam fringilla nonummy dolor, eget sed suspendisse augue ultricies metus autem. Odio quam in leo in integer cras, dignissim diam laoreet ut, orci dolor."}
                
            ]
        }
    ]
  }
 ]
}`;
    

    private _data$: Subject<any>;

    constructor(http:Http){
        this._data$ = new Subject();
    }
   
   setData(data:any):void{
        data = JSON.parse(this.DATA);
        this._data$.next(data);
    }
   

    getData(){
        return this._data$.asObservable();
    }

    // private extractData(res: Response) {
    //     let body = res.json();
    //     return body || { };
    // }

    // private handleError (error: Response | any) {
    //     // In a real world app, we might use a remote logging infrastructure
    //     let errMsg: string;
    //     if (error instanceof Response) {
    //         const body = error.json() || '';
    //         const err = body.error || JSON.stringify(body);
    //         errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    //     } else {
    //         errMsg = error.message ? error.message : error.toString();
    //     }
    //     console.error(errMsg);
    //     return Promise.reject(errMsg);
    // }
}
