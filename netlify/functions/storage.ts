import { User, Task, BucketItem, Coupon, HotReason } from "../../shared/schema";

class MemoryStorage {
  private users: User[] = [];
  private tasks: Task[] = [];
  private bucketItems: BucketItem[] = [];
  private coupons: Coupon[] = [];
  private hotReasons: HotReason[] = [];

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async getUserByUsernameAndPassword(username: string, password: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username && u.password === password);
  }

  async createUser(username: string, password: string): Promise<User> {
    const id = this.users.length + 1;
    const user: User = { id, username, password, partnerUsername: null };
    this.users.push(user);
    return user;
  }

  // Task operations
  async getTasks(userId: number): Promise<Task[]> {
    return this.tasks.filter(t => t.creatorId === userId);
  }

  async createTask(task: Omit<Task, "id" | "completed" | "createdAt">): Promise<Task> {
    const id = this.tasks.length + 1;
    const newTask = {
      ...task,
      id,
      completed: false,
      createdAt: new Date().toISOString()
    };
    this.tasks.push(newTask);
    return newTask;
  }

  async completeTask(taskId: number, userId: number): Promise<Task> {
    const task = this.tasks.find(t => t.id === taskId && t.creatorId === userId);
    if (!task) throw new Error("Task not found");
    task.completed = true;
    return task;
  }

  async deleteTask(taskId: number, userId: number): Promise<void> {
    const index = this.tasks.findIndex(t => t.id === taskId && t.creatorId === userId);
    if (index === -1) throw new Error("Task not found");
    this.tasks.splice(index, 1);
  }

  // Bucket list operations
  async getBucketList(userId: number): Promise<BucketItem[]> {
    return this.bucketItems.filter(i => i.userId === userId);
  }

  async createBucketItem(item: Omit<BucketItem, "id" | "completed">): Promise<BucketItem> {
    const id = this.bucketItems.length + 1;
    const newItem = {
      ...item,
      id,
      completed: false
    };
    this.bucketItems.push(newItem);
    return newItem;
  }

  async deleteBucketItem(itemId: number, userId: number): Promise<void> {
    const index = this.bucketItems.findIndex(i => i.id === itemId && i.userId === userId);
    if (index === -1) throw new Error("Item not found");
    this.bucketItems.splice(index, 1);
  }

  // Coupon operations
  async getCoupons(userId: number): Promise<Coupon[]> {
    return this.coupons.filter(c => c.creatorId === userId && !c.isInInventory);
  }

  async getCouponInventory(userId: number): Promise<Coupon[]> {
    return this.coupons.filter(c => c.receiverId === userId && c.isInInventory);
  }

  async createCoupon(coupon: Omit<Coupon, "id" | "redeemed" | "receiverId" | "isInInventory">): Promise<Coupon> {
    const id = this.coupons.length + 1;
    const newCoupon = {
      ...coupon,
      id,
      receiverId: null,
      isInInventory: false,
      redeemed: false
    };
    this.coupons.push(newCoupon);
    return newCoupon;
  }

  async sendCoupon(couponId: number, senderId: number, receiverId: number): Promise<Coupon> {
    const coupon = this.coupons.find(c => c.id === couponId && c.creatorId === senderId);
    if (!coupon) throw new Error("Coupon not found");
    coupon.receiverId = receiverId;
    coupon.isInInventory = true;
    return coupon;
  }

  async deleteCoupon(couponId: number, userId: number): Promise<void> {
    const index = this.coupons.findIndex(
      c => c.id === couponId && (c.creatorId === userId || c.receiverId === userId)
    );
    if (index === -1) throw new Error("Coupon not found");
    this.coupons.splice(index, 1);
  }

  // Hot reasons operations
  async getHotReasons(userId: number): Promise<HotReason[]> {
    return this.hotReasons.filter(r => r.authorId === userId);
  }

  async createHotReason(reason: Omit<HotReason, "id" | "createdAt">): Promise<HotReason> {
    const id = this.hotReasons.length + 1;
    const newReason = {
      ...reason,
      id,
      createdAt: new Date().toISOString()
    };
    this.hotReasons.push(newReason);
    return newReason;
  }
}

export const storage = new MemoryStorage();