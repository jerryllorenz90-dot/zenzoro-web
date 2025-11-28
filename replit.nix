{ pkgs }:

let
  node = pkgs.nodejs-18_x;
in
pkgs.mkShell {
  buildInputs = [ node ];
  shellHook = ''
    export NODE_OPTIONS="--max-old-space-size=1024"
  '';
}
