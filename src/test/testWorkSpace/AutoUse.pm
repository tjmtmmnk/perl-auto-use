package AutoUse;
use Foo::Bar;
use Hoge::Fuga;
use Hoge::Nyo;
use Hoge::Piyo qw(create_piyo my_name pipi piyo_piyo);
use Smart::Args::TypeTiny qw(args args_pos);

# check_type is not used
sub new_from_name {
    args_pos my $class => 'Class',
             my $name  => 'Str',
    ;

    my $piyo = create_piyo;

    my $hash = {
        type => 'type is exported but hash key',
    };

    $hash->{type};
    
    $hash{type};

    $hash->{'type'};

    $hash{$type};

    for(HOGE->@*) {
        print $_;
    }

    Foo::Bar::WOO;
}

# check_rule is not used
sub song {
    Hoge::Fuga->song;
    Hoge::Piyo->pipi(p => 1);
    Hoge::Piyo::pipi();
    Hoge::Nyo->pipi;
    my $sing = [ map {piyo_piyo(times => $_)} (0..1) ];
    my $name = my_name;
}

sub walk {
    args my $class => 'Class',
         my $stride => 'Int',
    ;
    print 'args is duplicate. so not used';
}

sub nyaa {
    print 'sub is ignored';
    print 'string nyaa is ignored';
    qw(
        ignore 
        nyaa
    );

    q/nyaa ignore/;

    qq(ignore nyaa);
}

=encoding utf-8

=head1 NAME

=head1 SYNOPSIS
    podnyaa
=cut