# PowerShell 面向对象编程学习笔记 | xrgzs.top

> 分类：书签 · NAS与自建服务 ｜ 来源：技术博客文章

![www.xrgzs.top 站点图标](images/i01-117_favicon.avif)


- 原始地址：<https://www.xrgzs.top/posts/powershell-oop/>

## 原文全文

本文为 PowerShell 面向对象编程（OOP）学习笔记，记录类与对象、构造函数、方法、属性、继承等核心概念与示例（原文含大量可直接运行的 PowerShell 示例代码，此处整理要点并保留关键代码骨架）：

**类与对象**

PowerShell 使用 `class` 关键字定义类，`New-Object` 或 `[Type]::new()` 创建对象。类成员包括属性（Property）与方法（Method）。

```powershell
class Person {
    [string]$Name
    [int]$Age
}
$p = [Person]::new()
$p.Name = "Tom"
```

**构造函数**

类中定义 `Person([string]$name, [int]$age)` 形式的构造函数，可带默认参数；未显式定义时使用默认构造函数。

**方法**

```powershell
class Person {
    [void]SayHello() {
        Write-Host "Hello, I'm $this.Name"
    }
}
```

**隐藏成员与静态成员**

- `hidden` 关键字隐藏成员，序列化/导出时默认不显示；
- `static` 定义静态方法与属性，通过 `[类名]::成员` 访问，无需实例化。

**继承**

PowerShell 类支持单继承：`class Student : Person`，子类可调用父类构造函数 `base()`，并可 override 父类方法。

**NoRunspaceAffinity**

`NoRunspaceAffinity` 特性标记类可在多个 Runspace 中使用，适用于并行作业（ForEach-Object -Parallel / Start-Job）中需要跨 Runspace 共享类定义的场景。

**验证属性**

属性上可加 `[ValidateNotNullOrEmpty()]`、`[ValidateRange(1,10)]`、`[ValidateSet("A","B")]` 等验证特性，赋值时自动校验。


本文是 xrgzs.top（潇然工作室技术博客）的 PowerShell 面向对象学习笔记，系统梳理 PowerShell 5+ 类机制：类定义与对象创建（`class` / `[Type]::new()`）、带默认参数的构造函数、实例方法（`$this`）、`hidden` 隐藏成员、`static` 静态成员（`[类名]::成员` 访问）、单继承（`class Student : Person` + `base()` 调用父类构造 + override）、`NoRunspaceAffinity` 特性（跨 Runspace 并行场景）以及 `[ValidateNotNullOrEmpty()]` / `[ValidateRange()]` / `[ValidateSet()]` 等验证属性。对想在 NAS 自动化脚本（如 Unraid/群晖上用 PowerShell 管理任务）中写类、或从 Python/C# 转向 PowerShell 的用户是很好的速查资料。原文以代码示例为主、无正文配图，此处以站点图标作本地配图。


`PowerShell` `OOP` `类` `构造函数` `继承` `static` `hidden` `NoRunspaceAffinity` `验证属性`

---
*本文由书签分类整理自动生成。*
