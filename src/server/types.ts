
export interface PageOptions {
    scripts?: string[];
    stylesheets?: string[];
    contentWidth?: number;
}

export interface TemplateParams {
    [name: string]: any;
}

export interface ExpressError extends Error {
    status?: number;
}


