export class AutoUseRegex {
    // e.g) @EXPORT = qw(hoge fuga);
    static readonly EXPORT = /@EXPORT(\s*=\s*)qw(\/|\()((\s*\w+\s*)*)(\/|\));/;

    // e.g) @EXPORT_OK = qw(hoge fuga);
    static readonly EXPORT_OK = /@EXPORT_OK(\s*=\s*)qw(\/|\()((\s*\w+\s*)*)(\/|\));/;

    // e.g) @EXPORT = get_public_functions;
    static readonly GET_PUBLIC_FUNCTIONS = /@EXPORT\s*=\s*get_public_functions\(?\)?;/;

    // e.g) sub hoge_fuga {}
    // not match private function start from '_' e.g. sub _hoge {}
    static readonly SUB_DECLARE = /sub (([a-z0-9][a-z0-9_]+))(\s*\{)/g;

    // e.g) package Hoge::Fuga;
    static readonly PACKAGE = /package ([A-Za-z0-9:]+);/;

    // e.g) use Hoge::Fuga;
    static readonly USE = /use [A-Za-z0-9:]+;/g;

    // e.g) use Hoge::Fuga qw(bar);
    static readonly USE_SUB = /use [A-Za-z0-9:]+ qw(\/|\()(\s*\w+\s*)*(\/|\));/g;

    // e.g) Hoge::Fuga->bar;
    static readonly METHOD_MODULE = /([A-Z][a-z0-9]*(::)?)+->/g;

    // e.g) Hoge::Fuga->bar();
    static readonly SUB_MODULE = /(([A-Z][a-z0-9]*(::)?)+)([a-z0-9_]+)(\(|;)/g;

    static readonly DELIMITER = /\s|\(/g;

    static readonly EXACT_MATCH_WORD_LOWER_CASE = /^[a-z0-9_]+$/;

    static readonly DECLARE = /use|my|our|local|sub|package/;
}