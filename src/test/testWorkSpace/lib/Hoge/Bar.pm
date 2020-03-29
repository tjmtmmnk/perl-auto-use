package Hoge::Bar;

use Exporter 'import';
our @EXPORT = qw/args/;

sub args {
    print 'exported and be duplicate';
}