import { XHRBackend, RequestOptions } from "@angular/http";
import { HttpService } from "./http.service";
import { LoaderService } from "./loader.service";

function HttpServiceFactory(backend: XHRBackend, options: RequestOptions, loaderService: LoaderService ) {
    return new HttpService(backend, options, loaderService);
}
export { HttpServiceFactory };