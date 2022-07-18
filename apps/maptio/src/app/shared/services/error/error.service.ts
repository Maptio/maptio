export class ErrorService {
  handleError(error: any) {
    //  1. remote logging infrastructure
    // 2. If severe error, should display some kind of warning
    // let errMsg: string;
    // if (error instanceof Response) {
    //     const body = error.json() || "";
    //     const err = body.error || JSON.stringify(body);
    //     errMsg = `${error.status} - ${error.statusText || ""} ${err}`;
    // } else {
    //     errMsg = error.message ? error.message : error.toString();
    // }
    // // console.error(errMsg);
    // return Promise.reject(errMsg);
  }
}
