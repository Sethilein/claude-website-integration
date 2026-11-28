#!/usr/bin/env python3
"""Item 154: the plate in the frequency lab follows the tone you hear, by the physics of a real plate.

Martin, 28 Nov 2026, 14:40: "der pitch wirkt sich überhaupt nicht auf die chladni mandala aus - wieso?",
14:41: "bitte verwende unser knowledge aus der database um es echt zu machen".

Why it did not react: the plate chose its figure only from the pulse rate f (the 1-45 Hz slider). The pitch fader
bent the tones you hear, but the plate never read it.

What a real plate does (our knowledge base, "Cymatics: What the Physics Shows, and Where the Claims Begin";
Chladni 1787, Germain 1816; Harvard and UC Santa Barbara lecture demonstrations):
 - every note gives its own figure; the plate moves at the frequency that drives it;
 - it is a high-Q resonator: a clear figure appears only when the tone sits on one of its resonances;
   between them the plate hardly moves and the sand stays where it lies;
 - square plate: the mode (n, m) rings near a frequency proportional to n^2 + m^2
   (figure: cos(n pi x)cos(m pi y) - cos(m pi x)cos(n pi y), as before);
 - round plate (night): Chladni's law, f proportional to (m + 2n)^2, m nodal diameters, n nodal circles;
   the mandala uses the modes with at least three diameters, so it always reads as a mandala.

So now:
 - the figure is chosen by the tone you hear (beat: the two tones' middle, 200 Hz x pitch + f/2;
   124 BPM: the 110 Hz pad x pitch; Schumann: the 100 Hz drone x pitch);
 - the sand moves hard only near a resonance and slows when the tone sits between two (resonance width 3.5 %);
 - while sound plays, the drive swells and fades with the pulse, so the grains jump in the rhythm you hear;
 - the plate is sized so that 200 Hz, the start tone on a laptop, gives the same figure as before (mode 2-5);
   the round plate is sized so 200 Hz gives m + 2n = 8. Those sizes are a choice; the rules are physics;
 - the night mandala no longer changes its figure every four bars on its own; it changes with the tone.
No new text: the captions keep their form; the number in the day caption is now the tone in Hz.

Usage:  python3 source/plate154/apply.py index.html [--out other.html] [--check]
"""
import sys, io

OLD = [
("var PN=0, gx=null, gy=null, cyLast=0;",
 "var PN=0, gx=null, gy=null, cyLast=0, cyK=null; /* item 154: the plate follows the tone you hear, by plate physics */"
 " function cyStir(){ if(!gx) return; for(var i=0;i<PN;i++){ gx[i]+=(Math.random()-0.5)*0.12; gy[i]+=(Math.random()-0.5)*0.12; } }"
 " var SQM=[]; (function(){ for(var a=1;a<=11;a++) for(var b=a+1;b<=12;b++) SQM.push([a,b,a*a+b*b]); })();"
 " var CIM=[]; (function(){ for(var a=3;a<=12;a++) for(var c=0;c<=4;c++) CIM.push([a,c,(a+2*c)*(a+2*c)*(1+0.012*a)]); })();"
 " var F0SQ=200/29, F0CI=200/(64*1.048), QW=0.035;"
 " function toneNow(){ var kk=kf(); return sch?100*kk:mode===\"club\"?110*kk:200*kk+f/2; }"
 " function pick(list,s){ var best=list[0], bd=1e9; for(var i=0;i<list.length;i++){ var d=Math.abs(Math.log(s/list[i][2])); if(d<bd){ bd=d; best=list[i]; } } return {a:best[0],b:best[1],key:best[0]+\"-\"+best[1],res:1/(1+Math.pow(bd/QW,2))}; }"),
("var k=Math.max(0,Math.min(SQ.length-1,Math.floor(Math.log(f)/Math.log(45)*SQ.length))), n, m, n2, kr, kr2, rot;\n"
 "      if(isDay){ n=SQ[k][0]; m=SQ[k][1]; cap.textContent=\"Chladni plate · mode \"+n+\"–\"+m+\" · \"+(f<10?f.toFixed(1):Math.round(f))+\" Hz\"; }\n"
 "      else { var bar=Math.floor(t*(mode===\"club\"?f:2.0667)/4); n=3+((k+bar)%5); n2=n*2+((bar>>1)%3); kr=2+(k%4)+((bar>>2)%2); kr2=kr+1.5; rot=t*0.12+0.18*pulse;",
 "var drv=toneNow(), md=isDay?pick(SQM,drv/F0SQ):pick(CIM,drv/F0CI), n, m, n2, kr, kr2, rot, res=md.res;\n"
 "      if(md.key!==cyK){ if(cyK!==null) cyStir(); cyK=md.key; }\n"
 "      if(isDay){ n=md.a; m=md.b; cap.textContent=\"Chladni plate · mode \"+n+\"–\"+m+\" · \"+Math.round(drv)+\" Hz\"; }\n"
 "      else { n=md.a; n2=n; kr=md.b+1; kr2=kr; rot=t*0.04+0.12*pulse;"),
("base=isDay?0.0012:0.0014, J=isDay?0.05:0.045+0.035*pulse;",
 "base=isDay?0.0012:0.0014, J=(isDay?0.05*(snd?0.55+0.45*pulse/0.7:1):0.045+0.035*pulse)*(0.15+0.85*res);   /* item 154: hard near a resonance, slow between two; the drive swells with the pulse */"),
("v=Math.sin(kr*PI*r)*Math.cos(n*th+rot)+0.3*Math.sin(kr2*PI*r)*Math.cos(n2*th-rot*1.4);",
 "v=Math.sin(kr*PI*r)*Math.cos(n*th+rot);   /* item 154: one mode of a round plate, n diameters, kr-1 circles */"),
]

def main():
    a = sys.argv[1:]
    if not a:
        print(__doc__); return 2
    src = a[0]; out = a[a.index("--out")+1] if "--out" in a else src
    s = io.open(src, encoding="utf-8").read()
    have = [s.count(new) for _, new in OLD]
    if "--check" in a:
        if all(h == 1 for h in have): print("OK: " + src + " carries item 154"); return 0
        print("CHANGES: item 154 is missing in " + src + " " + str(have)); return 1
    if all(h == 1 for h in have): print("nothing to change"); return 0
    for old, new in OLD:
        n = s.count(old)
        if n != 1: print("STOP: expected exactly one of: " + old[:70] + " (found " + str(n) + ")"); return 1
        s = s.replace(old, new)
    io.open(out, "w", encoding="utf-8", newline="").write(s)
    print("wrote " + out); return 0

if __name__ == "__main__":
    sys.exit(main())
