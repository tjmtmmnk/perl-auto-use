package Foo;
use strict;
use warnings;
use utf8;

use Smart::Args::TypeTiny qw(args);
use Hoge::Bar;

sub foo_func {
    args my $class => 'ClassName',
    ;

    Hoge::Bar->bar_func();
}