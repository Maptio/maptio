import { ErrorService } from "./../error/error.service";
import { XHRBackend, RequestOptions } from "@angular/http";
import { HttpService } from "./http.service";
import { LoaderService } from "./loader.service";

function HttpServiceFactory(backend: XHRBackend, options: RequestOptions, loaderService: LoaderService, errorService: ErrorService) {
    return new HttpService(backend, options, loaderService, errorService);
}
export { HttpServiceFactory };