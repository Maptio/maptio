import { Injectable } from '@angular/core';
import { UIService } from './ui.service';
import { environment } from '../../../config/environment';

/**
 * Represents the list of settings that are applied to a specific map
 * Should be stored in localStorage
 */
export class MapSettings {

    /**
     * Seed color for map in RGB format
     */
    mapColor: string;

    /**
     * Records the last position for each view
     */
    // lastPosition: {
    //     circles: string,
    //     tree: string,
    //     network: string
    // }

    /**
     * Number of columns for showing cards in the directory view
     */
    directoryColumnsNumber: number;

    /**
     * Settings for each view 
     */
    views: {
        tree: {
            expandedNodesIds: Array<string>
        }
    }
}


@Injectable()
export class MapSettingsService {

    width: number;
    height: number;

    constructor(private uiService: UIService) {
        this.width = this.uiService.getCanvasWidth();
        this.height = this.uiService.getCanvasHeight();
    }

    get(datasetId: string) {
        if (
            !localStorage.getItem(`map_settings_${datasetId}`)
            
        
        ) {
            localStorage.setItem(`map_settings_${datasetId}`, JSON.stringify(
                {
                    mapColor: environment.DEFAULT_MAP_BACKGOUND_COLOR,
                    // lastPosition: {
                    //     circles: `x=${this.height /2 }&y=${this.height / 2}&scale=1`,
                    //     tree: `x=${0}&y=${this.height/2}&scale=1`,
                    //     network: `x=0&y=${-this.height / 4}&scale=1`
                    // },
                    directoryColumnsNumber: 1,
                    views: {
                        tree: {
                            expandedNodesIds: []
                        }
                    }
                }
            ))
        }
        return JSON.parse(localStorage.getItem(`map_settings_${datasetId}`));
    }

    set(datasetId: string, settings: MapSettings) {
        localStorage.setItem(`map_settings_${datasetId}`, JSON.stringify(settings));
    }
}