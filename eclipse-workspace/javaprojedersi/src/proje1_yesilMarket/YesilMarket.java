package proje1_yesilMarket;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Scanner;

public class YesilMarket {

	public static List<String> urunler = new ArrayList<>();//Global degisken	
	public static List<Double> fiyatlar = new ArrayList<>();
	
	public static List<String> sepetUrunler = new ArrayList<>();
	public static List<Double> sepetKg = new ArrayList<>();
	public static List<Double> sepetFiyatlar = new ArrayList<>();
	
	
	
	
	public static void main(String[] args) {
		
		/* Yeşil Market alış-veriş programı.
         * 
         * 1. Adım: Ürünler ve fiyatları içeren listeleri oluşturunuz.
         *          No      Ürün         Fiyat
                  ====  =======        =========
                    00   Domates       2.10 TL 
                    01   Patates       3.20 TL
                    02   Biber        1.50 TL
                    03   Soğan       2.30 TL
                    04   Havuç              3.10 TL
                    05   Elma           1.20 TL
                    06   Muz          1.90 TL
                    07   Çilek             6.10 TL
                    08   Kavun        4.30 TL
                    09   Üzüm          2.70 TL
                    10   Limon        0.50 TL
                    
         * 2. Adım: Kullanıcının ürün nosuna göre listeden ürün seçmesini isteyiniz.
         * 3. Adım: Kaç kg satın almak istediğini sorunuz.
         * 4. Adım: Alınacak bu ürünü sepete ekleyiniz ve Sepeti yazdırınız.
         * 5. Başka bir ürün alıp almak istemediğini sorunuz.
         * 6. Eğer devam etmek istiyorsa yeniden ürün seçme kısmına yönlendiriniz.
         * 7. Eğer bitirmek istiyorsa ödeme kısmına geçiniz ve ödem sonrasında programı bitirinzi.
         */
		Scanner scan = new Scanner(System.in);
		
		
		urunler.addAll(Arrays.asList("Dometes","Patates","Biber","Sogan","Havuz",
			                    	"Elma","Muz","Cilek","Kavun","Uzum","Limon"));
		
		fiyatlar.addAll(Arrays.asList(2.10,3.20,1.50,2.30,3.10,1.20,1.90,6.10,
				                      4.30,2.70,0.50));
		String devam;
		double toplamFiyat=0.0;
		do {
		urunListele();
		System.out.println("Urununuzu numaraya gore seciniz: ");
		int urunNo = scan.nextInt();
		System.out.println("Agirlik giriniz: ");
		double kg = scan.nextDouble();
		sepeteEkle(urunNo,kg);
		toplamFiyat = Math.round(sepeteYazdir()) ;
		System.out.println("Alis verise devam etmek ister misiniz?");
		devam = scan.next();
		}while(devam.equalsIgnoreCase("e"));
		
		odeme(toplamFiyat);
	}

	public static void odeme(double toplamFiyat) {
		Scanner scan = new Scanner(System.in);
		
		System.out.println("***********************************************");
		System.out.println("***************** ODEME ***********************");
		System.out.printf("ODENECEK TOPLAM FIYAT: %.2f", toplamFiyat);
		double nakit=0.0;
		do {
		System.out.println("Lutfen Nakit Giriniz");
		
		nakit += scan.nextDouble();
		
		if (nakit<toplamFiyat) {
			System.out.println("Girilen Rakam Yetersizdir. ");
			System.out.println(toplamFiyat-nakit +" TL daha yatirmaniz gerekmektedir. ");
		}		
		}while(nakit<toplamFiyat);
		
		double paraUstu = nakit-toplamFiyat;
		if (paraUstu>0) {
			System.out.println("PARA USTU : "+paraUstu);
			
		}
		
		System.out.println("Yine Bekleriz");
	}

	public static double sepeteYazdir() {
		double fiyatToplami=0.0;
		double kgToplami=0.0;
		System.out.println("Urun adi \tKG \tFiyati");
		System.out.println("=============================");
		for (int i = 0; i <sepetUrunler.size(); i++) {
			System.out.println(sepetUrunler.get(i)+"\t \t"+sepetKg.get(i)+ "\t"+sepetFiyatlar.get(i));
			fiyatToplami+=sepetFiyatlar.get(i);
			kgToplami+=sepetKg.get(i);
			
		}
		System.out.println("=============================");
		System.out.println("\t TOPLAM:"+kgToplami+ "\t"+fiyatToplami);
		
		return fiyatToplami;
	}

	public static void sepeteEkle(int urunNo, double kg) {

		sepetUrunler.add(urunler.get(urunNo));
		sepetKg.add(kg);
		sepetFiyatlar.add(fiyatlar.get(urunNo)*kg);
		
		
	}

	public static void urunListele() {
		System.out.println("No\t Urunler \tFiyatlar");
		System.out.println("===\t ======= \t========");
		
		for (int i = 0; i < urunler.size(); i++) {
			System.out.println(i + "\t" + urunler.get(i) +"\t\t" + fiyatlar.get(i));
			
		
		}
		
	}
	
	
}
