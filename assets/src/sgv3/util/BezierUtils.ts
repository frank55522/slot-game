
import { _decorator, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BezierUtils')
export class BezierUtils {

 /// <summary>
    /// 根據T值，計算貝塞爾曲線上面相對應的點
    /// </summary>
    /// <param name="t"></param>T值
    /// <param name="p0"></param>起始點
    /// <param name="p1"></param>控制點
    /// <param name="p2"></param>目標點
    /// <returns></returns>根據T值計算出來的貝賽爾曲線點
    private static CalculateCubicBezierPoint(t:number, p0:Vec3, p1:Vec3, p2:Vec3)
    {
        let u = 1 - t;
        let tt = t * t;
        let uu = u * u;

        let p = new Vec3(uu * p0.x, uu * p0.y ,0);
        let calculation = 2 * u * t ;
        p = new Vec3(p.x+(calculation * p1.x), p.y + (calculation * p1.y), 0);
        p = new Vec3(p.x+(tt * p2.x), p.y + (tt * p2.y), 0);

        return p;
    }

    /// <summary>
    /// 獲取儲存貝塞爾曲線點的陣列
    /// </summary>
    /// <param name="startPoint"></param>起始點
    /// <param name="controlPoint"></param>控制點
    /// <param name="endPoint"></param>目標點
    /// <param name="segmentNum"></param>取樣點的數量
    /// <returns></returns>儲存貝塞爾曲線點的陣列
    public static GetBeizerList( startPoint:Vec3, controlPoint:Vec3, endPoint:Vec3, segmentNum:number)
    {
        let path =new Array<Vec3>(segmentNum);

        for (var i = 1; i <= segmentNum; i++)
        {
                var t = i / segmentNum;
                var pixel = this.CalculateCubicBezierPoint(t, startPoint, controlPoint, endPoint);
                path[i - 1] = pixel;
                //Debug.Log(path[i - 1]);
        }
        return path;

    }
}