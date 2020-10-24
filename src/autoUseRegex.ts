export class AutoUseRegex {
    // e.g) @EXPORT = qw(hoge fuga);
    static readonly EXPORT = /@EXPORT\s*=\s*([\w\s\(\)\/]+);/g;

    // e.g) @EXPORT_OK = qw(hoge fuga);
    static readonly EXPORT_OK = /@EXPORT_OK\s*=\s*([\w\s\(\)\/]+);/g;

    // e.g) @EXPORT = get_public_functions;
    static readonly GET_PUBLIC_FUNCTIONS = /@EXPORT\s*=\s*get_public_functions\(?\)?;/g;

    // e.g) sub hoge_fuga {}
    // not match private function start from '_' e.g. sub _hoge {}
    static readonly SUB_DECLARE = /sub (([a-z0-9][a-z0-9_]+))/g;

    // e.g) package Hoge::Fuga;
    static readonly PACKAGE = /package ([A-Za-z0-9:]+);/g;

    // e.g) use Hoge::Fuga;
    static readonly USE = /use ([A-Za-z0-9:]+);/g;

    // e.g) use Hoge::Fuga qw(bar);
    static readonly USE_SUB = /use ([A-Za-z0-9:]+) qw(\/|\()((\w+|\s)*)(\/|\));/g;

    static readonly USE_AND_SUB = /use (([A-Z][a-z0-9]*(::)?)+)[\w\s\(\)]*;/g;

    // e.g) Hoge::Fuga->bar
    static readonly METHOD_MODULE = /(([A-Z][a-z0-9]*(::)?)+)->([a-z0-9_]+)/g;

    // e.g) Hoge::Fuga::bar
    static readonly SUB_MODULE = /(([A-Z][a-z0-9]*(::)?)+)::([a-z0-9_]+)/g;

    // e.g) Hoge::Fuga::BAR
    static readonly CONSTANT = /(([A-Z][a-z0-9]*(::)?)+)::([A-Z_]+[^\w-:])/g;

    static readonly DELIMITER = /\s|\(|\)|;|,|\{|\}|\[|\]/g;

    static readonly COMMENT = /#.*(\n|\r\n)/g;

    static readonly STRING = /('[^'"]*')|("[^"]*")|(q(w|q)?[\(\{\/\[<]([^\)\}\/\]>])*[\)\}\/\]>])/g;

    static readonly HASH = /\$\w+(->)?\{.+\}/g;

    static readonly EXACT_MATCH_WORD_LOWER_CASE = /^[a-z0-9_]+$/;

    static readonly EXACT_MATCH_WORD_DECLARE = /^(use|my|our|local|sub|package)$/;

    static readonly NEW_LINE = /(\n|\r|\r\n)/g;

    static readonly POD = /=(head|pod|encoding)[\s\S]*=cut/g;
}

export function concatPatterns(patterns: string[]): string {
    let pattern = '';
    for (let i = 0; i < patterns.length; i++) {
        pattern += (i !== patterns.length - 1 ? patterns[i] + '|' : patterns[i]);
    }
    return pattern;
}
