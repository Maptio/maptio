
import { Injectable } from "@angular/core";

export interface Setting {
    [name: string]: any;
};

export class AuthorityLabelSetting implements Setting {
    [authority: string]: any;
}

export class HelperLabelSetting implements Setting {
    helper: any;
}