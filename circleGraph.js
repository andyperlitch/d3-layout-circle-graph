(function(d3) {
  'use strict';

  function radiansToDegrees(radians) {
    return (radians / Math.PI) * 180;
  }

  function circleGraph() {

    var radius;
    var nodeMap;
    var nodeKeyAccessor = function(n) {
      return n.name;
    };
    var edgeSourceKeyAccessor = function(e) {
      return e.source;
    }
    var edgeTargetKeyAccessor = function(e) {
      return e.target;
    }
    var line = d3.svg.line()
      .interpolate('bundle')
      .tension(0.4);
    var pathFn = function(d) {
      return line(d.coords);
    };

    function radiansToX(radians) {
      return Math.round(Math.sin(radians) * radius * 100)/100;
    }

    function radiansToY(radians) {
      return Math.round(Math.cos(radians) * radius * 100)/100;
    }

    // Public API
    var layout = {
      tension: function(t) {
        if (typeof t === 'number') {
          line.tension(t);
          return layout;
        }
        return line.tension();
      },
      
      key: function(fn) {
        if (fn) {
          nodeKeyAccessor = fn;
          return layout;
        }
        return nodeKeyAccessor;
      },
      
      radius: function (r) {
        if (typeof r === 'number') {
          radius = r;
          return layout;
        }
        return radius;
      },

      nodes: function (nodes) {
        nodeMap = {};
        var numNodes = nodes.length;
        var radianSeparation = (2 * Math.PI) / numNodes;
        var halfSeparation = radianSeparation / 2;
        nodes.forEach(function(n, i) {

          // calculate radians
          n.radians = Math.PI - i * radianSeparation;
          n.degrees = radiansToDegrees(n.radians);

          // set x and y based on radians and radius
          n.x = radiansToX(n.radians);
          n.y = radiansToY(n.radians);

          // set the range
          n.radianRange = [
            n.radians - halfSeparation,
            n.radians + halfSeparation
          ];

          // add to map
          nodeMap[ nodeKeyAccessor(n) ] = n;

        });
        return layout;
      },

      edgeSource: function(fn) {
        if (typeof fn === 'function') {
          edgeSourceKeyAccessor = fn;
          return layout;
        }
        return edgeSourceKeyAccessor;
      },

      edgeTarget: function(fn) {
        if (typeof fn === 'function') {
          edgeTargetKeyAccessor = fn;
          return layout;
        }
        return edgeTargetKeyAccessor;
      },

      edges: function(edges) {
        edges.forEach(function(e) {
          var coords = [];
          var from = nodeMap[ edgeSourceKeyAccessor(e) ];
          var to = nodeMap[ edgeTargetKeyAccessor(e) ];
          if (from !== to) {
            coords.push(
              [ from.x, from.y ],
              [0,0],
              [ to.x, to.y ]
            );
          }
          else {
            var mp1Radians = from.radians + Math.PI / 2;
            var mp2Radians = from.radians + Math.PI;
            var mp3Radians = from.radians + 3 * Math.PI / 2;
            coords.push(
              [ from.x, from.y ],
              [ radiansToX(mp1Radians), radiansToY(mp1Radians)],
              [ radiansToX(mp2Radians), radiansToY(mp2Radians)],
              [ radiansToX(mp3Radians), radiansToY(mp3Radians)],
              [ from.x, from.y ]
            );
          }
          e.coords = coords;
        });
        return layout;
      },

      line: pathFn,

      nodeMap: function() {
        return nodeMap;
      }
    };

    return layout;
  }

  d3.layout.circleGraph = circleGraph;
  
})(d3);
